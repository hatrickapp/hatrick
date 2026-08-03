from uuid import UUID

from pydantic import BaseModel

from src.app.routers.classes.authentication_classes import UserProfileRank, UserProfileStats
from src.app.routers.classes.base import BaseResponse
from src.app.routers.classes.prediction_classes import RankingAccuracyItem, RankingItem

class PublicUserSearchItem(BaseModel):
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    plan: str


class PublicUserSearchResponse(BaseResponse):
    users: list[PublicUserSearchItem]
    next_cursor: UUID | None


class FollowUserItem(BaseModel):
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    is_following: bool


class FollowListResponse(BaseResponse):
    users: list[FollowUserItem]
    next_cursor: UUID | None


class FollowStatusResponse(BaseResponse):
    followers_count: int
    following_count: int
    is_following: bool


class PublicUserProfileResponse(BaseResponse):
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    followers_count: int
    following_count: int
    is_following: bool
    plan: str
    stats: UserProfileStats
    ranking: RankingItem
    rank: UserProfileRank | None
    next_rank: UserProfileRank | None
    points_to_next_rank: int | None
    top_percentage: float
    accuracy: list[RankingAccuracyItem]
    ranking_rules: list[str]
