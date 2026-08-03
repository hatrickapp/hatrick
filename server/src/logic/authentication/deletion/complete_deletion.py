from datetime import datetime, timezone
from uuid import UUID

from asyncpg import Pool
from redis.asyncio import Redis

from src.app.config.email_templates import AccountDeletionSuccessTemplate
from src.app.config.lua_manager import LuaScriptManager
from src.app.crypto.encryption.aes_decrypt import decrypt
from src.app.errors.domains.authentication_errors import OtpVerificationError, PendingUserDeletionNotFoundError, UserNotFoundError
from src.app.events.event_emitter import event_emitter
from src.app.events.pubsub.event_publisher import RedisEventPublisher
from src.store.cache.authentication.expire_all_redis_sessions import expire_all_redis_sessions
from src.store.cache.authentication.pending_deletion import delete_pending_deletion, get_pending_deletion
from src.store.cache.authentication.verify_otp import verify_otp
from src.store.sql.authentication.sessions.expire_all_sessions import expire_all_sessions
from src.store.sql.authentication.users.select_user_by_id import select_user_by_id
from src.store.sql.authentication.users.soft_delete_user import soft_delete_user
from src.store.sql.leagues.delete_hosted_leagues_for_user import delete_hosted_leagues_for_user

async def complete_deletion(pool: Pool, cache: Redis, lua_manager: LuaScriptManager, user_id: UUID, otp: str, country: str, device: str, publisher: RedisEventPublisher) -> None:
    pending = await get_pending_deletion(cache, str(user_id))
    if pending is None:
        raise PendingUserDeletionNotFoundError()

    if not await verify_otp(cache, pending.email_hash, otp):

        raise OtpVerificationError()

    async with pool.acquire() as conn:
        user = await select_user_by_id(conn, user_id)
        if user is None:
            raise UserNotFoundError()
        
        email = decrypt(user.email_encrypted)

        async with conn.transaction():
            await soft_delete_user(conn, user_id)
            await delete_hosted_leagues_for_user(conn, user_id)
            await expire_all_sessions(conn, user_id)

    await expire_all_redis_sessions(cache, lua_manager, user_id)

    await publisher.publish(
        "session:invalidation",
        "EXPIRE_USER_SESSIONS_MEMORY",
        {"user_id": str(user_id)},
    )

    await delete_pending_deletion(cache, str(user_id))

    timestamp = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    template = AccountDeletionSuccessTemplate(device=device, country=country, timestamp=timestamp)
    
    await event_emitter(cache, "SEND_EMAIL_MESSAGE", {
        "email": email,
        "subject": template.subject,
        "message": template.html
    })
