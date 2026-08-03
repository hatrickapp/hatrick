import asyncio
from uuid import UUID

from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.logging.logger_setup import get_logger
from src.logic.workers.redis.session_expire_retries import SINGLE_SESSION_RETRIES
from src.store.cache.authentication.expire_redis_device_sessions import expire_redis_device_sessions

logger = get_logger(__name__)

async def handle_device_sessions_expire(redis: Redis, lua_manager: LuaScriptManager, payload: dict) -> None:
    device_ids_str = payload.get("device_ids", [])
    if not device_ids_str:
        logger.error("missing_device_ids", extra={"payload": payload})
        return

    try:
        device_ids = [UUID(did) for did in device_ids_str]
    except ValueError:
        logger.error("invalid_device_ids", extra={"payload": payload})
        return

    for attempt, delay in enumerate(SINGLE_SESSION_RETRIES, start=1):
        try:
            await expire_redis_device_sessions(redis, lua_manager, device_ids, emit_on_error=False)
            return
        except Exception:
            logger.warning("handle_device_sessions_expire_retry", extra={"attempt": attempt})
            await asyncio.sleep(delay)

    logger.error("handle_device_sessions_expire_exhausted")
