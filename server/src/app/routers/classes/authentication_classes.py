from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from src.app.routers.classes.base import BaseResponse

class CompleteDeletionRequest(BaseModel):
    otp: str

class CompleteLogoutRequest(BaseModel):
    pass

class InitiateDeletionRequest(BaseModel):
    pass

class UpdateProfileNameRequest(BaseModel):
    name: str = Field(..., min_length=5, max_length=128)

class UpdateProfileUsernameRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)

class UpdateProfileTimezoneRequest(BaseModel):
    timezone: str = Field(..., min_length=1, max_length=64)

# --- OAuth Request Classes ---

class NativeAppleOAuthRequest(BaseModel):
    identity_token: str
    authorization_code: str | None = None
    nonce: str | None = None
    user_identifier: str | None = None
    email: str | None = None
    full_name: str | None = None

class NativeGoogleOAuthRequest(BaseModel):
    id_token: str

# --- Response Classes ---

class AuthenticatedUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: UUID
    user_id: UUID
    email: str
    account_status: str
    role: str
    expires_at: datetime

class AuthenticatedUserResponse(BaseResponse):
    user: AuthenticatedUser | None

class SessionResponse(BaseResponse):
    expires_at: datetime

class MobileAuthResponse(BaseResponse):
    session_token: str
    expires_at: datetime

class UserIdResponse(BaseResponse):
    user_id: UUID

class ProfileNameResponse(BaseResponse):
    name: str

class ProfileUsernameResponse(BaseResponse):
    username: str

class ProfileTimezoneResponse(BaseResponse):
    timezone: str

# --- User Data Response Classes ---

class UserProfileStats(BaseModel):
    total_points: int
    predictions_count: int
    settled_predictions: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int


class UserProfileRank(BaseModel):
    rank_key: str
    name: str
    min_points: int
    icon_key: str
    color_hex: str


class UserProfileResponse(BaseResponse):
    user_id: UUID
    email: str
    name: str | None
    username: str
    username_changed_at: datetime | None
    username_next_change_at: datetime | None
    username_setup_completed: bool
    followers_count: int
    following_count: int
    account_status: str
    plan: str
    provider: str
    timezone: str
    created_at: datetime
    stats: UserProfileStats
    rank: UserProfileRank | None
    next_rank: UserProfileRank | None
    points_to_next_rank: int | None


class UserSessionItem(BaseModel):
    session_id: UUID
    country: str
    created_at: datetime
    expires_at: datetime


class UserSessionsResponse(BaseResponse):
    sessions: list[UserSessionItem]
