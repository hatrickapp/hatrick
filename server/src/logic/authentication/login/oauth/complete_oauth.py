from dataclasses import dataclass
from datetime import datetime

from asyncpg import Pool
from redis.asyncio import Redis

from src.app.config.lua_manager import LuaScriptManager
from src.app.events.pubsub.event_publisher import RedisEventPublisher
from src.logic.authentication.login.oauth.identity import Provider, lookup_oauth_identity
from src.logic.authentication.shared.bootstrap_new_user import bootstrap_new_user
from src.logic.authentication.shared.issue_session import issue_session
from src.store.cache.authentication.expire_redis_session_by_hash import expire_redis_session_by_hash
from src.store.cache.authentication.set_redis_session import set_redis_session

@dataclass
class OAuthCompleteResult:
    session_token: str
    expires_at: datetime


async def complete_oauth_session(
    pool: Pool,
    cache: Redis,
    lua_manager: LuaScriptManager,
    publisher: RedisEventPublisher,
    *,
    provider: Provider,
    provider_subject: str | None,
    email: str | None,
    country: str,
    name: str | None = None,
    avatar_url: str | None = None,
) -> OAuthCompleteResult:
    async with pool.acquire() as conn:
        existing = await lookup_oauth_identity(conn, provider, provider_subject, email)

        async with conn.transaction():
            if existing is not None:
                session = await issue_session(conn, existing.user_id, country)
                session_user_id = existing.user_id
                account_status = existing.account_status
                role = existing.role
            else:
                if email is None:
                    raise ValueError("OAuth email is required when creating a new user.")
                bootstrap = await bootstrap_new_user(
                    conn,
                    email=email,
                    provider=provider,
                    country=country,
                    name=name,
                    avatar_url=avatar_url,
                    oauth_subject=provider_subject,
                )
                session = bootstrap.session
                session_user_id = bootstrap.user_id
                account_status = "active"
                role = "consumer"

    await set_redis_session(
        lua_manager,
        session.session_token,
        session.session_id,
        session_user_id,
        session.expires_at,
        account_status=account_status,
        role=role,
    )
    if session.killed_session_token_hash:
        await expire_redis_session_by_hash(cache, lua_manager, session.killed_session_token_hash)
        await publisher.publish(
            "session:invalidation",
            "EXPIRE_SINGLE_SESSION_MEMORY",
            {"session_token_hash": session.killed_session_token_hash},
        )

    return OAuthCompleteResult(
        session_token=session.session_token,
        expires_at=session.expires_at,
    )
