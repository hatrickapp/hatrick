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

async def upsert_best_global_rank(conn: Connection, user_id: UUID, global_rank: int) -> int:
    row = await conn.fetchrow(
        """
        INSERT INTO user_stats (user_id, best_global_rank, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET best_global_rank = CASE
                WHEN user_stats.best_global_rank IS NULL THEN EXCLUDED.best_global_rank
                ELSE LEAST(user_stats.best_global_rank, EXCLUDED.best_global_rank)
            END,
            updated_at = NOW()
        RETURNING best_global_rank
        """,
        user_id,
        global_rank,
    )
    return row["best_global_rank"]
