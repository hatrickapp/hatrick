from starlette.requests import Request

from server.src.app.middleware.phases.phase1.endpoint_matrix import get_endpoint_config, get_route_template
from server.src.app.middleware.phases.phase1.extract_identity import extract_identity
from server.src.app.middleware.phases.phase1.helpers.classify_ip_type import IPClassification
from server.src.app.middleware.phases.phase1.request_context import RequestContext

async def execute_phase_1(request: Request, ip: str, ip_classification: IPClassification | None) -> RequestContext:
    method = request.method
    path = request.url.path
    endpoint_config = get_endpoint_config(method, path)
    route_template = get_route_template(method, path)

    session_token = request.cookies.get("X-Session-Token") or None
    if not session_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip() or None

    country, device = await extract_identity(request, ip)
    idempotency_key = request.headers.get("X-Idempotency-Key")

    client_type_raw = request.headers.get("X-Client-Type", "web").lower().strip()
    client_type = client_type_raw if client_type_raw in ("web", "mobile") else "web"

    return RequestContext(
        ip=ip,
        method=method,
        path=path,
        route_template=route_template,
        endpoint_config=endpoint_config,
        session_token=session_token,
        idempotency_key=idempotency_key,
        country=country,
        device=device,
        ip_classification=ip_classification,
        client_type=client_type,
    )
