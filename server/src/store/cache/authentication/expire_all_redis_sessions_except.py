from uuid import UUID

from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.events.event_emitter import event_emitter
from src.app.logging.logger_setup import get_logger

logger = get_logger(__name__)

async def expire_all_redis_sessions_except(
    cache: Redis,
    lua_manager: LuaScriptManager,
    user_id: UUID,
    session_token_hash: str,
) -> None:
    user_key = f"user_sessions:{user_id}"

    try:
        await lua_manager.execute("authentication/expire_all_redis_sessions_except", [user_key], [session_token_hash])
    except Exception:
        logger.warning("expire_all_redis_sessions_except_failed_emitting_event", extra={"user_id": str(user_id)})
        await event_emitter(
            cache,
            "USER_SESSIONS_EXPIRE_EXCEPT_FAILED",
            {"user_id": str(user_id), "session_token_hash": session_token_hash}
        )
