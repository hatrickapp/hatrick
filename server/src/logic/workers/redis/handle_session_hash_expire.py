import asyncio

from redis.asyncio import Redis

from server.src.app.config.lua_manager import LuaScriptManager
from server.src.app.logging.logger_setup import get_logger
from server.src.logic.workers.redis.session_expire_retries import SINGLE_SESSION_RETRIES
from server.src.store.cache.authentication.expire_redis_session_by_hash import expire_redis_session_by_hash

logger = get_logger(__name__)

async def handle_session_hash_expire(redis: Redis, lua_manager: LuaScriptManager, payload: dict) -> None:
    session_token_hash = payload.get("session_token_hash")
    if not session_token_hash:
        logger.error("missing_session_token_hash", extra={"payload": payload})
        return

    for attempt, delay in enumerate(SINGLE_SESSION_RETRIES, start=1):
        try:
            await expire_redis_session_by_hash(redis, lua_manager, session_token_hash, emit_on_error=False)
            return
        except Exception:
            logger.warning("handle_session_hash_expire_retry", extra={"attempt": attempt})
            await asyncio.sleep(delay)

    logger.error("handle_session_hash_expire_exhausted")
