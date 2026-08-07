from dataclasses import dataclass
from functools import lru_cache
import re
from typing import Literal

@dataclass
class EndpointConfig:
    access: Literal["authenticated", "authenticated-admin", "authenticated-user", "public"]
    rate_by: Literal["ip", "user", "none"]
    rate_hits: int = 0
    rate_window: int = 0
    max_body_bytes: int = 1024
    csp: bool = False
    idempotency: bool = False


RouteEntry = tuple[str, str, EndpointConfig]


ROUTE_MATRIX: list[RouteEntry] = [
    ("GET", "/v1/health", EndpointConfig(access="public", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0)),

    # --- OpenAPI Docs (dev only) ---
    ("GET", "/docs", EndpointConfig(access="public", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0)),
    ("GET", "/docs/oauth2-redirect", EndpointConfig(access="public", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0)),
    ("GET", "/redoc", EndpointConfig(access="public", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0)),
    ("GET", "/openapi.json", EndpointConfig(access="public", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0)),

    # --- Authentication ---
    ("GET", "/v1/auth/user/me", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/auth/user/profile", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("POST", "/v1/auth/user/profile/name", EndpointConfig(access="authenticated", rate_by="user", rate_hits=10, rate_window=300, max_body_bytes=512, idempotency=True)),
    ("POST", "/v1/auth/user/profile/username", EndpointConfig(access="authenticated", rate_by="user", rate_hits=10, rate_window=300, max_body_bytes=256, idempotency=True)),
    ("POST", "/v1/auth/user/profile/visibility", EndpointConfig(access="authenticated", rate_by="user", rate_hits=10, rate_window=300, max_body_bytes=128, idempotency=True)),
    ("POST", "/v1/auth/user/profile/timezone", EndpointConfig(access="authenticated", rate_by="user", rate_hits=10, rate_window=300, max_body_bytes=256, idempotency=True)),
    ("GET", "/v1/auth/user/sessions", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("POST", "/v1/auth/logout", EndpointConfig(access="authenticated", rate_by="user", rate_hits=10, rate_window=60, max_body_bytes=64, idempotency=True)),
    ("POST", "/v1/auth/account/delete/initiate", EndpointConfig(access="authenticated", rate_by="user", rate_hits=3, rate_window=3600, max_body_bytes=64, idempotency=True)),
    ("POST", "/v1/auth/account/delete/complete", EndpointConfig(access="authenticated", rate_by="user", rate_hits=5, rate_window=3600, max_body_bytes=128, idempotency=True)),
    ("POST", "/v1/auth/oauth/google/native", EndpointConfig(access="public", rate_by="ip", rate_hits=10, rate_window=60, max_body_bytes=4096)),
    ("POST", "/v1/auth/oauth/apple/native", EndpointConfig(access="public", rate_by="ip", rate_hits=10, rate_window=60, max_body_bytes=8192)),

    # --- Billing ---
    ("GET", "/v1/billing/revenuecat/status", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0)),
    ("POST", "/v1/billing/revenuecat/sync", EndpointConfig(access="authenticated", rate_by="user", rate_hits=10, rate_window=60, max_body_bytes=0)),
    ("POST", "/v1/billing/revenuecat/webhook", EndpointConfig(access="public", rate_by="ip", rate_hits=120, rate_window=60, max_body_bytes=262144)),

    # --- Sports ---
    ("GET", "/v1/sports/competitions", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/sports/matches", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/sports/matches/{match_id}", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),

    # --- Predictions ---
    ("POST", "/v1/predictions/matches/{match_id}", EndpointConfig(access="authenticated", rate_by="user", rate_hits=60, rate_window=60, max_body_bytes=512, idempotency=True)),
    ("GET", "/v1/predictions", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),

    # --- Leagues ---
    ("GET", "/v1/leagues", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/leagues/config", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("POST", "/v1/leagues", EndpointConfig(access="authenticated", rate_by="user", rate_hits=20, rate_window=300, max_body_bytes=4096, idempotency=True)),
    ("GET", "/v1/leagues/invitations", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("POST", "/v1/leagues/invitations/{league_invitation_id}/join", EndpointConfig(access="authenticated", rate_by="user", rate_hits=30, rate_window=300, max_body_bytes=0, idempotency=True)),
    ("POST", "/v1/leagues/invitations/{league_invitation_id}/reject", EndpointConfig(access="authenticated", rate_by="user", rate_hits=30, rate_window=300, max_body_bytes=0, idempotency=True)),
    ("GET", "/v1/leagues/{league_id}", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/leagues/{league_id}/standings", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("POST", "/v1/leagues/{league_id}/settings", EndpointConfig(access="authenticated", rate_by="user", rate_hits=20, rate_window=300, max_body_bytes=1024, idempotency=True)),
    ("POST", "/v1/leagues/{league_id}/invitations", EndpointConfig(access="authenticated", rate_by="user", rate_hits=30, rate_window=300, max_body_bytes=128, idempotency=True)),
    ("POST", "/v1/leagues/{league_id}/leave", EndpointConfig(access="authenticated", rate_by="user", rate_hits=20, rate_window=300, max_body_bytes=0, idempotency=True)),
    ("POST", "/v1/leagues/{league_id}/members/{member_user_id}/remove", EndpointConfig(access="authenticated", rate_by="user", rate_hits=60, rate_window=300, max_body_bytes=0, idempotency=True)),

    # --- Users ---
    ("GET", "/v1/users/search", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("POST", "/v1/users/{username}/follow", EndpointConfig(access="authenticated", rate_by="user", rate_hits=60, rate_window=60, max_body_bytes=0, idempotency=True)),
    ("POST", "/v1/users/{username}/unfollow", EndpointConfig(access="authenticated", rate_by="user", rate_hits=60, rate_window=60, max_body_bytes=0, idempotency=True)),
    ("GET", "/v1/users/{username}/followers", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/users/{username}/following", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
    ("GET", "/v1/users/{username}", EndpointConfig(access="authenticated", rate_by="none", rate_hits=0, rate_window=0, max_body_bytes=0, csp=True)),
]


STATIC_ENDPOINTS: dict[tuple[str, str], EndpointConfig] = {
    (method, path): config for method, path, config in ROUTE_MATRIX if "{" not in path
}


DYNAMIC_PATTERNS: list[tuple[str, re.Pattern[str], EndpointConfig, str]] = [
    (
        method,
        re.compile("^" + re.sub(r"\{[a-zA-Z0-9_]+\}", r"[^/]+", path) + "$", re.ASCII),
        config,
        path,
    )
    for method, path, config in ROUTE_MATRIX
    if "{" in path
]


@lru_cache(maxsize=4000)
def get_endpoint_config(method: str, path: str) -> EndpointConfig | None:
    normalized_method = method.upper()
    config = STATIC_ENDPOINTS.get((normalized_method, path))
    if config is not None:
        return config
    for entry_method, regex, dynamic_config, _ in DYNAMIC_PATTERNS:
        if entry_method == normalized_method and regex.match(path):
            return dynamic_config
    return None


@lru_cache(maxsize=4000)
def get_route_template(method: str, path: str) -> str:
    normalized_method = method.upper()
    if (normalized_method, path) in STATIC_ENDPOINTS:
        return path
    for entry_method, regex, _, template in DYNAMIC_PATTERNS:
        if entry_method == normalized_method and regex.match(path):
            return template
    return path
