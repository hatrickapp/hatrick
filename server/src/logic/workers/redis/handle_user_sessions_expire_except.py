import asyncio
from uuid import UUID

from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.logging.logger_setup import get_logger
from src.logic.workers.redis.session_expire_retries import ALL_SESSIONS_RETRIES
from src.store.cache.authentication.expire_all_redis_sessions_except import expire_all_redis_sessions_except

logger = get_logger(__name__)

async def handle_user_sessions_expire_except(redis: Redis, lua_manager: LuaScriptManager, payload: dict) -> None:
    user_id_str = payload.get("user_id")
    session_token_hash = payload.get("session_token_hash")
    if not user_id_str or not session_token_hash:
        logger.error("missing_user_id_or_session_token_hash", extra={"payload": payload})
        return

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        logger.error("invalid_user_id", extra={"payload": payload})
        return

    for attempt, delay in enumerate(ALL_SESSIONS_RETRIES, start=1):
        try:
            await expire_all_redis_sessions_except(redis, lua_manager, user_id, session_token_hash)
            return
        except Exception:
            logger.warning("handle_user_sessions_expire_except_retry", extra={"user_id": user_id_str, "attempt": attempt})
            await asyncio.sleep(delay)

    logger.error("handle_user_sessions_expire_except_exhausted", extra={"user_id": user_id_str})
