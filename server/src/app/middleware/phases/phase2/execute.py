from asyncpg import Pool
from cachetools import TTLCache
from fastapi import HTTPException
from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.logging.logger_setup import get_logger
from src.app.middleware.phases.phase1.request_context import RequestContext
from src.store.sql.authentication.sessions.select_session_by_token_hash import select_session_by_token_hash
from src.store.sql.authentication.sessions.shared.resolve_session_by_token_hash import resolve_session_by_token_hash

logger = get_logger(__name__)

async def execute_phase_2(
    ctx: RequestContext,
    pool: Pool,
    cache: Redis,
    session_cache: TTLCache,
    lua_manager: LuaScriptManager,
) -> RequestContext:
    if ctx.endpoint_config is None:
        return ctx

    access = ctx.endpoint_config.access

    if access == "public":
        return ctx

    # Authenticated routes require a valid session token.
    if not ctx.session_token:
        logger.warning("missing_session_token", extra={"path": ctx.route_template, "method": ctx.method})
        raise HTTPException(status_code=401, detail="UNAUTHORIZED")

    session = await resolve_session_by_token_hash(cache, pool, ctx.session_token, session_cache, lua_manager)

    if session is None:
        logger.warning("invalid_session", extra={"path": ctx.route_template, "method": ctx.method})
        raise HTTPException(status_code=401, detail="INVALID_SESSION")

    if access == "authenticated-admin":
        async with pool.acquire() as conn:
            fresh_session = await select_session_by_token_hash(conn, ctx.session_token)
        if fresh_session is None:
            logger.warning("invalid_admin_session", extra={"path": ctx.route_template, "method": ctx.method})
            raise HTTPException(status_code=401, detail="INVALID_SESSION")
        session = fresh_session

    ctx.user_id = session.user_id
    ctx.user_role = session.role

    if access == "authenticated-admin" and ctx.user_role != "admin":
        logger.warning(
            "admin_access_denied",
            extra={"path": ctx.route_template, "method": ctx.method, "user_id": str(session.user_id)},
        )
        raise HTTPException(status_code=403, detail="ADMIN_REQUIRED")

    if access == "authenticated-user" and ctx.user_role != "consumer":
        logger.warning(
            "consumer_access_denied",
            extra={"path": ctx.route_template, "method": ctx.method, "user_id": str(session.user_id)},
        )
        raise HTTPException(status_code=403, detail="CONSUMER_REQUIRED")

    return ctx
