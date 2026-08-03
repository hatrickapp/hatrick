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
    avatar_url: str | None
    plan: str
@dataclass
class PublicUserProfile:
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
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

def map_stats(row) -> PublicUserStats:
    return PublicUserStats(
        total_points=row["total_points"],
        predictions_count=row["predictions_count"],
        settled_predictions=row["settled_predictions"],
        correct_outcomes=row["correct_outcomes"],
        correct_btts=row["correct_btts"],
        correct_scorers=row["correct_scorers"],
        hatricks=row["hatricks"],
    )
