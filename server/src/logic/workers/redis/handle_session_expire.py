import asyncio

from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.logging.logger_setup import get_logger
from src.logic.workers.redis.session_expire_retries import SINGLE_SESSION_RETRIES
from src.store.cache.authentication.expire_redis_session import expire_redis_session

logger = get_logger(__name__)

async def handle_session_expire(redis: Redis, lua_manager: LuaScriptManager, payload: dict) -> None:
    session_token = payload.get("session_token")
    if not session_token:
        logger.error("missing_session_token", extra={"payload": payload})
        return

    for attempt, delay in enumerate(SINGLE_SESSION_RETRIES, start=1):
        try:
            await expire_redis_session(redis, lua_manager, session_token, emit_on_error=False)
            return
        except Exception:
            logger.warning("handle_session_expire_retry", extra={"attempt": attempt})
            await asyncio.sleep(delay)

    logger.error("handle_session_expire_exhausted")
