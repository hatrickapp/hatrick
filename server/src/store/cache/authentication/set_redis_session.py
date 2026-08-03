from datetime import datetime
from uuid import UUID

from src.app.config.lua_manager import LuaScriptManager
from src.app.crypto.encryption.hash_blake2s import hash_blake2s
from src.app.logging.logger_setup import get_logger

logger = get_logger(__name__)

async def set_redis_session(
    lua_manager: LuaScriptManager,
    session_token: str,
    session_id: UUID,
    user_id: UUID,
    expires_at: datetime,
    account_status: str = "active",
    role: str = "consumer",
) -> None:
    session_token_hash = hash_blake2s(session_token)
    ttl_seconds = 86400

    session_key = f"session:{session_token_hash}"
    user_key = f"user_sessions:{user_id}"

    try:
        await lua_manager.execute(
            "authentication/set_redis_session",
            [session_key, user_key],
            [
                session_token_hash,
                str(session_id),
                str(user_id),
                expires_at.isoformat(),
                account_status,
                role,
                str(ttl_seconds),
            ]
        )
    except Exception:
        logger.warning("set_redis_session_failed", extra={"user_id": str(user_id)})
