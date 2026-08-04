from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from src.store.sql.sports.read_models import CompetitionRow

@dataclass
class LeagueScoringSettings:
    include_outcome_points: bool
    include_btts_points: bool
    include_scorer_points: bool
    include_hatrick_bonus: bool
    only_hatricks: bool


@dataclass
class LeagueRow:
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
    scoring: LeagueScoringSettings
    winner_user_id: UUID | None
    finished_at: datetime | None
    created_at: datetime
    updated_at: datetime
    member_count: int
    is_host: bool
    user_rank: int | None
    user_points: int | None
    competitions: list[CompetitionRow] | None = None


@dataclass
class LeagueInvitationRow:
    league_invitation_id: UUID
    league: LeagueRow
    invited_by_user_id: UUID
    invited_by_username: str
    invited_by_name: str | None
    invited_by_plan: str
    status: str
    created_at: datetime
    responded_at: datetime | None
    expires_at: datetime


@dataclass
class LeagueStandingRow:
    user_id: UUID
    username: str
    name: str | None
    plan: str
    rank: int
    points: int
    predictions_count: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
    is_current_user: bool


@dataclass
class LeagueMemberScoreRow:
    user_id: UUID
    joined_at: datetime
    score_starts_at: datetime


@dataclass
class LeaguePredictionScoreRow:
    user_id: UUID
    outcome_correct: bool | None
    btts_correct: bool | None
    scorer_correct: bool | None
    hatrick_bonus_awarded: bool


@dataclass
class LeagueScoredStanding:
    user_id: UUID
    rank: int
    points: int
    predictions_count: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
