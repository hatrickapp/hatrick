import asyncio
from uuid import UUID

from redis.asyncio import Redis

from server.src.app.config.lua_manager import LuaScriptManager
from server.src.app.logging.logger_setup import get_logger
from server.src.logic.workers.redis.session_expire_retries import ALL_SESSIONS_RETRIES
from server.src.store.cache.authentication.expire_all_redis_sessions import expire_all_redis_sessions

logger = get_logger(__name__)

async def handle_user_sessions_expire(redis: Redis, lua_manager: LuaScriptManager, payload: dict) -> None:
    user_id_str = payload.get("user_id")
    if not user_id_str:
        logger.error("missing_user_id", extra={"payload": payload})
        return

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        logger.error("invalid_user_id", extra={"payload": payload})
        return

    for attempt, delay in enumerate(ALL_SESSIONS_RETRIES, start=1):
        try:
            await expire_all_redis_sessions(redis, lua_manager, user_id, emit_on_error=False)
            return
        except Exception:
            logger.warning("handle_user_sessions_expire_retry", extra={"user_id": user_id_str, "attempt": attempt})
            await asyncio.sleep(delay)

    logger.error("handle_user_sessions_expire_exhausted", extra={"user_id": user_id_str})
