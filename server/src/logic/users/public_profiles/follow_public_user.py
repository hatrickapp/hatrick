from uuid import UUID

from asyncpg import Pool

from server.src.store.sql.users.follow_user import FollowCounts, follow_user

async def follow_public_user(pool: Pool, follower_user_id: UUID, username: str) -> FollowCounts | None:
    normalized = username.strip().lower()
    async with pool.acquire() as conn:
        return await follow_user(conn, follower_user_id, normalized)
