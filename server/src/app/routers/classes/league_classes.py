from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from server.src.app.routers.classes.base import BaseResponse
from server.src.app.routers.classes.sports_classes import CompetitionItem

class LeagueScoringItem(BaseModel):
    include_outcome_points: bool
    include_btts_points: bool
    include_scorer_points: bool
    include_hatrick_bonus: bool
    only_hatricks: bool


class CreateLeagueRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=3, max_length=60)
    competition_ids: list[UUID] = Field(default_factory=list, max_length=50)
    scoring: LeagueScoringItem
    starts_at: datetime
    ends_at: datetime
    include_existing_points: bool
    max_members: int = Field(..., ge=2)


class PlanLimitItem(BaseModel):
    plan: str
    active_league_limit: int
    can_customize_competitions: bool
    can_customize_scoring: bool
    can_count_existing_points: bool
    can_change_username: bool
    priority_support: bool


class LeagueLimitItem(BaseModel):
    default_max_members: int
    max_members: int
    max_period_days: int
    max_start_days_ahead: int


class PlusOfferingItem(BaseModel):
    price_label: str
    cta_label: str
    features: list[str]


class LeagueScoringPresetItem(BaseModel):
    preset_key: str
    label: str
    description: str
    scoring: LeagueScoringItem
    is_default: bool


class CreateLeagueInvitationRequest(BaseModel):
    user_id: UUID


class UpdateLeagueRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ends_at: datetime | None = None
    status: str | None = Field(default=None, pattern="^(active|paused|closed|deleted)$")


class LeagueSummaryItem(BaseModel):
    league_id: UUID
    host_user_id: UUID
    host_username: str
    host_name: str | None
    name: str
    status: str
    starts_at: datetime
    ends_at: datetime
    include_existing_points: bool
    max_members: int
    member_count: int
    scoring: LeagueScoringItem
    winner_user_id: UUID | None
    finished_at: datetime | None
    is_host: bool
    user_rank: int | None
    user_points: int | None
    competitions: list[CompetitionItem] = Field(default_factory=list)


class LeagueInvitationItem(BaseModel):
    league_invitation_id: UUID
    league: LeagueSummaryItem
    invited_by_user_id: UUID
    invited_by_username: str
    invited_by_name: str | None
    invited_by_avatar_url: str | None
    invited_by_plan: str
    status: str
    created_at: datetime
    responded_at: datetime | None
    expires_at: datetime


class LeagueStandingItem(BaseModel):
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    plan: str
    rank: int
    points: int
    predictions_count: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
    is_current_user: bool


class LeaguesHomeResponse(BaseResponse):
    active_leagues: list[LeagueSummaryItem]
    history_leagues: list[LeagueSummaryItem]


class LeaguesConfigResponse(BaseResponse):
    plan_limits: dict[str, PlanLimitItem]
    league_limits: LeagueLimitItem
    plus_offering: PlusOfferingItem
    scoring_presets: list[LeagueScoringPresetItem]


class LeagueResponse(BaseResponse):
    league: LeagueSummaryItem


class LeagueInvitationResponse(BaseResponse):
    invitation: LeagueInvitationItem


class LeagueInvitationsResponse(BaseResponse):
    invitations: list[LeagueInvitationItem]


class LeagueStandingsResponse(BaseResponse):
    standings: list[LeagueStandingItem]
    next_cursor: UUID | None
