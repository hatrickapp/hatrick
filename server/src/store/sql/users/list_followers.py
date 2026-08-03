from dataclasses import dataclass
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.users.follow_user_item import follow_user_item

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

async def list_followers(
    conn: Connection,
    username: str,
    viewer_user_id: UUID,
    query_text: str,
    cursor: UUID | None,
    limit: int,
) -> list[FollowUserItem]:
    if query_text:
        query = """
        WITH target AS (
            SELECT user_id
            FROM users
            WHERE lower(username) = $1
              AND is_deleted = FALSE
              AND username_setup_completed = TRUE
            LIMIT 1
        ),
        cursor_user AS (
            SELECT lower(username) AS cursor_username, user_id AS cursor_user_id
            FROM users
            WHERE user_id = $4
              AND is_deleted = FALSE
              AND username_setup_completed = TRUE
        )
        SELECT
            u.user_id AS cursor_id,
            u.user_id,
            u.username,
            CASE WHEN u.show_name_publicly THEN u.name ELSE NULL END AS name,
            u.avatar_url,
            EXISTS (
                SELECT 1
                FROM user_follows vf
                WHERE vf.follower_user_id = $2
                  AND vf.followed_user_id = u.user_id
            ) AS is_following
        FROM user_follows f
        JOIN target t ON t.user_id = f.followed_user_id
        JOIN users u ON u.user_id = f.follower_user_id
        LEFT JOIN cursor_user cu ON TRUE
        WHERE u.is_deleted = FALSE
          AND u.username_setup_completed = TRUE
          AND lower(u.username) >= $3
          AND lower(u.username) < ($3 || chr(65535))
          AND (
            $4::uuid IS NULL
            OR cu.cursor_username IS NULL
            OR (lower(u.username), u.user_id) > (cu.cursor_username, cu.cursor_user_id)
          )
        ORDER BY lower(u.username), u.user_id
        LIMIT $5
        """
        rows = await conn.fetch(query, username, viewer_user_id, query_text, cursor, limit)
    else:
        query = """
        WITH target AS (
            SELECT user_id
            FROM users
            WHERE lower(username) = $1
              AND is_deleted = FALSE
              AND username_setup_completed = TRUE
            LIMIT 1
        ),
        cursor_follow AS (
            SELECT created_at AS cursor_created_at, follow_id AS cursor_follow_id
            FROM user_follows
            WHERE follow_id = $3
        )
        SELECT
            f.follow_id AS cursor_id,
            u.user_id,
            u.username,
            CASE WHEN u.show_name_publicly THEN u.name ELSE NULL END AS name,
            u.avatar_url,
            EXISTS (
                SELECT 1
                FROM user_follows vf
                WHERE vf.follower_user_id = $2
                  AND vf.followed_user_id = u.user_id
            ) AS is_following
        FROM user_follows f
        JOIN target t ON t.user_id = f.followed_user_id
        JOIN users u ON u.user_id = f.follower_user_id
        LEFT JOIN cursor_follow cf ON TRUE
        WHERE u.is_deleted = FALSE
          AND u.username_setup_completed = TRUE
          AND (
            $3::uuid IS NULL
            OR cf.cursor_created_at IS NULL
            OR (f.created_at, f.follow_id) < (cf.cursor_created_at, cf.cursor_follow_id)
          )
        ORDER BY f.created_at DESC, f.follow_id DESC
        LIMIT $4
        """
        rows = await conn.fetch(query, username, viewer_user_id, cursor, limit)
    return [follow_user_item(row) for row in rows]
