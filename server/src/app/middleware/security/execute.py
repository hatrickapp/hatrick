from cachetools import TTLCache
from fastapi import HTTPException
from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.crypto.encryption.hash_blake2s import hash_blake2s
from src.app.logging.logger_setup import get_logger
from src.app.middleware.phases.phase1.endpoint_matrix import EndpointConfig
from src.app.middleware.phases.phase1.helpers.classify_ip_type import IPClassification
from src.app.middleware.phases.phase1.request_context import RequestContext
from src.app.middleware.security.rate_limiting.check_rate_limit import check_rate_limit

logger = get_logger(__name__)

async def execute_ip_rate_limit(
    ip: str,
    ip_classification: IPClassification | None,
    endpoint_config: EndpointConfig,
    method: str,
    route_template: str,
    cache: Redis,
    lua_manager: LuaScriptManager,
    rate_limit_cache: TTLCache,
) -> None:
    if endpoint_config.rate_by != "ip":
        return

    if ip_classification and ip_classification.ip_type == "ipv6":
        limits = [
            (f"rl:{method}:{route_template}:ip:{ip_classification.normalized}", max(endpoint_config.rate_hits * 3, 3), endpoint_config.rate_window),
            (f"rl:{method}:{route_template}:ip48:{ip_classification.net_48}", max(endpoint_config.rate_hits * 10, 20), endpoint_config.rate_window),
            (f"rl:{method}:{route_template}:ip32:{ip_classification.net_32}", max(endpoint_config.rate_hits * 50, 100), endpoint_config.rate_window),
        ]
    else:
        ip_value = ip_classification.normalized if ip_classification else ip
        limits = [
            (f"rl:{method}:{route_template}:ip:{ip_value}", endpoint_config.rate_hits, endpoint_config.rate_window),
        ]

    allowed, retry_after_sec, exhausted_key = await check_rate_limit(lua_manager, limits, rate_limit_cache)

    if not allowed:
        logger.warning(
            "ip_rate_limit_exceeded",
            extra={
                "ip_hash": hash_blake2s(ip, digest_size=5),
                "path": route_template,
                "method": method,
                "exhausted_key": exhausted_key,
            },
        )
        raise HTTPException(
            status_code=429,
            detail="RATE_LIMIT_EXCEEDED",
            headers={"Retry-After": str(retry_after_sec)},
        )


async def execute_user_rate_limit(
    ctx: RequestContext,
    cache: Redis,
    lua_manager: LuaScriptManager,
    rate_limit_cache: TTLCache,
) -> None:
    if ctx.endpoint_config.rate_by not in ("user", "hybrid"):
        return

    if ctx.user_id is None:
        return

    limits = [
        (f"rl:{ctx.method}:{ctx.route_template}:u:{ctx.user_id}", ctx.endpoint_config.rate_hits, ctx.endpoint_config.rate_window),
    ]

    allowed, retry_after_sec, exhausted_key = await check_rate_limit(lua_manager, limits, rate_limit_cache)

    if not allowed:
        logger.warning(
            "user_rate_limit_exceeded",
            extra={
                "user_id_hash": hash_blake2s(str(ctx.user_id), digest_size=5),
                "path": ctx.route_template,
                "method": ctx.method,
                "exhausted_key": exhausted_key,
            },
        )
        raise HTTPException(
            status_code=429,
            detail="RATE_LIMIT_EXCEEDED",
            headers={"Retry-After": str(retry_after_sec)},
        )

