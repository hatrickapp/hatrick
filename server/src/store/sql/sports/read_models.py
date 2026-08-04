from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

@dataclass
class CompetitionRow:
    competition_id: UUID
    name: str
    country: str | None
    type: str
    logo_url: str | None
    sort_order: int


@dataclass
class TeamRow:
    team_id: UUID
    name: str
    short_name: str | None
    logo_url: str | None


@dataclass
class PredictionRow:
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


@dataclass
class MatchRow:
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
    competition: CompetitionRow
    home_team: TeamRow
    away_team: TeamRow
    user_prediction: PredictionRow | None


@dataclass
class MatchPlayerRow:
    player_id: UUID
    team_id: UUID | None
    name: str
    position: str | None
    shirt_number: int | None
    source: str


@dataclass
class MatchGoalRow:
    match_goal_id: UUID
    match_id: UUID
    team_id: UUID | None
    player_id: UUID | None
    scorer_name: str
    shirt_number: int | None
    event_minute: int | None
    event_extra: int | None
    goal_type: str


@dataclass
class PredictionHistoryRow:
    prediction: PredictionRow
    match: MatchRow
    scorer: MatchPlayerRow | None


@dataclass
class RankingRow:
    user_id: UUID
    name: str | None
    points: int
    predictions_count: int
    settled_predictions: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
    global_rank: int
    total_ranked_users: int
    best_global_rank: int | None
