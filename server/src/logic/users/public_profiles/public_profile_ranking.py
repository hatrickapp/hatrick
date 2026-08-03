from dataclasses import dataclass
from uuid import UUID

from src.logic.predictions.prediction_actions import RankingAccuracy
from src.store.sql.users.select_public_user_profile import PublicUserStats

@dataclass
class PublicProfileRanking:
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
    top_percentage: float
    accuracy: list[RankingAccuracy]
    ranking_rules: list[str]
