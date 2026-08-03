from uuid import UUID

from pydantic import BaseModel, Field

from src.app.routers.classes.base import BaseResponse
from src.app.routers.classes.sports_classes import MatchListItem, MatchPredictionItem, PlayerItem

class UpsertPredictionRequest(BaseModel):
    outcome_pick: str = Field(..., pattern="^(home|draw|away)$")
    btts_pick: bool
    scorer_player_id: UUID


class PredictionResponse(BaseResponse):
    prediction: MatchPredictionItem


class PredictionHistoryItem(BaseModel):
    prediction: MatchPredictionItem
    match: MatchListItem
    scorer: PlayerItem | None


class PredictionsHistoryResponse(BaseResponse):
    predictions: list[PredictionHistoryItem]
    next_cursor: UUID | None


class RankingItem(BaseModel):
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


class RankingAccuracyItem(BaseModel):
    key: str
    label: str
    correct: int
    total: int
    ratio_percent: float
