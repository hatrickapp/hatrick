from dataclasses import dataclass
from uuid import UUID, uuid7

from asyncpg import Connection

@dataclass
class FollowCounts:
    followers_count: int
    following_count: int
    is_following: bool
@dataclass
class FollowUserItem:
    cursor_id: UUID
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    is_following: bool

async def follow_user(conn: Connection, follower_user_id: UUID, followed_username: str) -> FollowCounts | None:
    query = """
    WITH target AS (
        SELECT user_id
        FROM users
        WHERE lower(username) = $2
          AND is_deleted = FALSE
          AND username_setup_completed = TRUE
        LIMIT 1
    ),
    inserted AS (
        INSERT INTO user_follows (follow_id, follower_user_id, followed_user_id)
        SELECT $3, $1, target.user_id
        FROM target
        WHERE target.user_id <> $1
        ON CONFLICT (follower_user_id, followed_user_id) DO NOTHING
        RETURNING followed_user_id
    ),
    resolved AS (
        SELECT user_id AS followed_user_id FROM target
    )
    SELECT
        (SELECT COUNT(*)::int FROM user_follows uf WHERE uf.followed_user_id = resolved.followed_user_id) AS followers_count,
        (SELECT COUNT(*)::int FROM user_follows uf WHERE uf.follower_user_id = resolved.followed_user_id) AS following_count,
        EXISTS (
            SELECT 1
            FROM user_follows uf
            WHERE uf.follower_user_id = $1
              AND uf.followed_user_id = resolved.followed_user_id
        ) AS is_following
    FROM resolved
    """
    row = await conn.fetchrow(query, follower_user_id, followed_username, uuid7())
    if row is None:
        return None
    return FollowCounts(
        followers_count=row["followers_count"],
        following_count=row["following_count"],
        is_following=row["is_following"],
    )
