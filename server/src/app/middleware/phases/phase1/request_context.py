from dataclasses import dataclass
from uuid import UUID

from src.app.middleware.phases.phase1.endpoint_matrix import EndpointConfig
from src.app.middleware.phases.phase1.helpers.classify_ip_type import IPClassification

@dataclass
class RequestContext:
    ip: str
    method: str
    path: str
    route_template: str
    endpoint_config: EndpointConfig | None
    session_token: str | None
    idempotency_key: str | None
    country: str
    ip_classification: IPClassification | None = None
    user_id: UUID | None = None
    user_role: str | None = None
    idempotency_lock_acquired: bool = False
    client_type: str = "web"
