from uuid import UUID

from asyncpg import Pool

from server.src.store.sql.users.follow_user import FollowCounts
from server.src.store.sql.users.unfollow_user import unfollow_user

async def unfollow_public_user(pool: Pool, follower_user_id: UUID, username: str) -> FollowCounts | None:
    normalized = username.strip().lower()
    async with pool.acquire() as conn:
        return await unfollow_user(conn, follower_user_id, normalized)
