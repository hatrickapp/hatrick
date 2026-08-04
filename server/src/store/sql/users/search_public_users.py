from dataclasses import dataclass
from uuid import UUID

from asyncpg import Connection

@dataclass
class PublicUserStats:
    total_points: int
    predictions_count: int
    settled_predictions: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
@dataclass
class PublicUserSearchItem:
    user_id: UUID
    username: str
    name: str | None
    plan: str
@dataclass
class PublicUserProfile:
    user_id: UUID
    username: str
    name: str | None
    followers_count: int
    following_count: int
    is_following: bool
    plan: str
    stats: PublicUserStats
    global_rank: int
    total_ranked_users: int
    best_global_rank: int | None
    rank_key: str | None
    rank_name: str | None
    rank_min_points: int | None
    rank_icon_key: str | None
    rank_color_hex: str | None
    next_rank_key: str | None
    next_rank_name: str | None
    next_rank_min_points: int | None
    next_rank_icon_key: str | None
    next_rank_color_hex: str | None
    points_to_next_rank: int | None

async def search_public_users(
    conn: Connection,
    query_text: str,
    cursor: UUID | None,
    limit: int,
) -> list[PublicUserSearchItem]:
    query = """
    WITH cursor_user AS (
        SELECT lower(username) AS cursor_username, user_id AS cursor_user_id
        FROM users u
        WHERE user_id = $2
          AND is_deleted = FALSE
          AND username_setup_completed = TRUE
    )
    SELECT
        u.user_id,
        u.username,
        CASE WHEN u.show_name_publicly THEN u.name ELSE NULL END AS name,
        u.plan
    FROM users u
    LEFT JOIN cursor_user cu ON TRUE
    WHERE u.is_deleted = FALSE
      AND u.username_setup_completed = TRUE
      AND lower(u.username) >= $1
      AND lower(u.username) < ($1 || chr(65535))
      AND (
        $2::uuid IS NULL
        OR cu.cursor_username IS NULL
        OR (lower(u.username), u.user_id) > (cu.cursor_username, cu.cursor_user_id)
      )
    ORDER BY lower(u.username), u.user_id
    LIMIT $3
    """
    rows = await conn.fetch(query, query_text, cursor, limit)
    return [
        PublicUserSearchItem(
            user_id=row["user_id"],
            username=row["username"],
            name=row["name"],
            plan=row["plan"],
        )
        for row in rows
    ]
