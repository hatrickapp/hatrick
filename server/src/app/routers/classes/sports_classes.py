from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from server.src.app.routers.classes.base import BaseResponse

class CompetitionItem(BaseModel):
    competition_id: UUID
    name: str
    country: str | None
    type: str
    logo_url: str | None
    sort_order: int


class CompetitionsResponse(BaseResponse):
    competitions: list[CompetitionItem]


class TeamItem(BaseModel):
    team_id: UUID
    name: str
    short_name: str | None
    logo_url: str | None


class PlayerItem(BaseModel):
    player_id: UUID
    team_id: UUID | None = None
    name: str
    photo_url: str | None
    position: str | None
    shirt_number: int | None = None
    source: str | None = None


class MatchGoalItem(BaseModel):
    match_goal_id: UUID
    match_id: UUID
    team_id: UUID | None
    player_id: UUID | None
    scorer_name: str
    shirt_number: int | None
    event_minute: int | None
    event_extra: int | None
    goal_type: str


class MatchPredictionItem(BaseModel):
    prediction_id: UUID
    outcome_pick: str
    btts_pick: bool
    scorer_player_id: UUID
    status: str
    points: int
    outcome_correct: bool | None
    btts_correct: bool | None
    scorer_correct: bool | None
    hatrick_bonus_awarded: bool
    created_at: datetime
    updated_at: datetime


class MatchListItem(BaseModel):
    match_id: UUID
    kickoff_at: datetime
    status: str
    status_long: str | None
    home_score: int | None
    away_score: int | None
    final_home_score: int | None
    final_away_score: int | None
    is_locked: bool
    is_settled: bool
    is_void: bool
    competition: CompetitionItem
    home_team: TeamItem
    away_team: TeamItem
    user_prediction: MatchPredictionItem | None = None


class MatchesResponse(BaseResponse):
    matches: list[MatchListItem]


class MatchDetailResponse(BaseResponse):
    match: MatchListItem
    players: list[PlayerItem]
    goals: list[MatchGoalItem]
