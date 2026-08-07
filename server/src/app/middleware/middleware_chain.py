from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.app.errors.base import AppError
from src.app.errors.handler import build_error_content, http_error_response
from src.app.logging.logger_setup import get_logger
from src.app.middleware.phases.phase1.endpoint_matrix import get_endpoint_config, get_route_template
from src.app.middleware.phases.phase1.execute import execute_phase_1
from src.app.middleware.phases.phase1.extract_identity import extract_ip
from src.app.middleware.phases.phase2.execute import execute_phase_2
from src.app.middleware.phases.phase3.execute import execute_phase_3
from src.app.middleware.security.execute import execute_ip_rate_limit, execute_user_rate_limit
from src.app.middleware.security.web.cors_handler import handle_cors_preflight
from src.app.middleware.security.web.csp_handler import generate_csp_nonce
from src.app.middleware.security.web.response_headers import build_response_headers
from src.store.cache.idempotency import delete_idempotency_key

logger = get_logger(__name__)


class MiddlewareChain:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = scope.get("method", "")
        path = scope.get("path", "")
        endpoint_config = get_endpoint_config(method, path)

        app_state = scope["app"].state
        pool = app_state.psql_pool
        cache = app_state.redis
        session_cache = app_state.session_cache
        rate_limit_cache = app_state.rate_limit_cache
        lua_manager = app_state.lua_manager
        raw_headers: dict[bytes, bytes] = {k.lower(): v for k, v in scope.get("headers", [])}

        is_health_or_docs = path in ("/v1/health", "/docs", "/docs/oauth2-redirect", "/redoc", "/openapi.json")
        if method != "OPTIONS" and not is_health_or_docs:
            app_sig = raw_headers.get(b"x-app-signature")
            if not app_sig or app_sig.decode("latin-1") != "XFzPIumBsq8aAyVMZX8Oq4GablUh6bDv+YwJl5qbedI=":
                logger.error(f"Access Denied! Path: {path}, Method: {method}. Received headers: { {k.decode('latin-1', errors='replace'): v.decode('latin-1', errors='replace') for k, v in raw_headers.items()} }")
                raise HTTPException(status_code=403, detail="ACCESS_DENIED")

        origin_raw = raw_headers.get(b"origin")
        origin = origin_raw.decode("latin-1") if origin_raw else None

        ctx = None
        error_response = None
        body_payload = bytearray()

        async def custom_receive():
            return {"type": "http.request", "body": bytes(body_payload), "more_body": False}

        request = Request(scope, custom_receive)

        try:
            if method in ("POST", "PUT", "PATCH"):
                max_bytes = endpoint_config.max_body_bytes if endpoint_config else 1024

                cl_header = raw_headers.get(b"content-length")
                if cl_header:
                    try:
                        if int(cl_header) > max_bytes:
                            raise HTTPException(status_code=413, detail="REQUEST_BODY_TOO_LARGE")
                    except ValueError:
                        raise HTTPException(status_code=400, detail="INVALID_CONTENT_LENGTH")

                more_body = True
                total_received = 0
                while more_body:
                    message = await receive()
                    chunk = message.get("body", b"")
                    total_received += len(chunk)

                    if total_received > max_bytes:
                        while message.get("more_body", False):
                            message = await receive()
                        raise HTTPException(status_code=413, detail="REQUEST_BODY_TOO_LARGE")

                    body_payload.extend(chunk)
                    more_body = message.get("more_body", False)

            if method == "OPTIONS":
                response = handle_cors_preflight(origin)
                await response(scope, custom_receive, send)
                return

            ip, ip_classification = extract_ip(request)

            route_template = get_route_template(method, path)
            if endpoint_config is not None:
                await execute_ip_rate_limit(ip, ip_classification, endpoint_config, method, route_template, cache, lua_manager, rate_limit_cache)

            ctx = await execute_phase_1(request, ip, ip_classification)

            if ctx.endpoint_config is None:
                raise HTTPException(status_code=404, detail="ENDPOINT_NOT_REGISTERED")

            if ctx.endpoint_config.csp and request.method == "GET":
                request.state.csp_nonce = generate_csp_nonce()

            ctx = await execute_phase_2(ctx, pool, cache, session_cache, lua_manager)
            await execute_user_rate_limit(ctx, cache, lua_manager, rate_limit_cache)
            ctx = await execute_phase_3(ctx, lua_manager, request)

            request.state.user_id = ctx.user_id
            request.state.user_role = ctx.user_role
            request.state.ip = ctx.ip
            request.state.session_token = ctx.session_token
            request.state.country = ctx.country
            request.state.client_type = ctx.client_type

        except AppError as exc:
            if ctx and ctx.idempotency_lock_acquired:
                await delete_idempotency_key(cache, ctx.idempotency_key)
            error_response = JSONResponse(
                status_code=exc.status_code,
                content=build_error_content(exc.code, exc.message)
            )
        except HTTPException as exc:
            if ctx and ctx.idempotency_lock_acquired:
                await delete_idempotency_key(cache, ctx.idempotency_key)
            error_response = http_error_response(exc)
        except Exception:
            if ctx and ctx.idempotency_lock_acquired:
                await delete_idempotency_key(cache, ctx.idempotency_key)
            logger.exception("unhandled_exception_in_middleware")
            error_response = http_error_response(HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR"))

        if error_response:
            for k, v in build_response_headers(origin, ctx, request):
                error_response.headers[k.decode("latin-1")] = v.decode("latin-1")
            await error_response(scope, custom_receive, send)
            return

        async def custom_send(msg):
            if msg["type"] == "http.response.start":
                status = msg["status"]
                if status in (429, 500, 502, 503, 504) and ctx and ctx.idempotency_lock_acquired:
                    await delete_idempotency_key(cache, ctx.idempotency_key)

                extra_headers = build_response_headers(origin, ctx, request)
                existing_keys = {h[0] for h in extra_headers}
                filtered = [h for h in msg.get("headers", []) if h[0] not in existing_keys]
                msg["headers"] = filtered + extra_headers

            await send(msg)

        await self.app(scope, custom_receive, custom_send)
