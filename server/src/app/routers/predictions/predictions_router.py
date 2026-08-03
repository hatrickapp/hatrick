from datetime import date
from uuid import UUID

from fastapi import APIRouter, Query

from src.app.routers.classes.prediction_classes import PredictionHistoryItem, PredictionResponse, PredictionsHistoryResponse, UpsertPredictionRequest
from src.app.routers.dependencies.router_dependencies import PoolDep, UserDep
from src.logic.predictions.prediction_actions import get_prediction_history, save_prediction
from src.logic.sports.responses import match_item, player_item, prediction_item

router = APIRouter(prefix="/v1")


@router.post("/predictions/matches/{match_id}", response_model=PredictionResponse)
async def upsert_prediction_endpoint(match_id: UUID, body: UpsertPredictionRequest, pool: PoolDep, user_id: UserDep):
    prediction = await save_prediction(pool, user_id, match_id, body.outcome_pick, body.btts_pick, body.scorer_player_id)
    return PredictionResponse(prediction=prediction_item(prediction))


@router.get("/predictions", response_model=PredictionsHistoryResponse)
async def prediction_history_endpoint(
    pool: PoolDep,
    user_id: UserDep,
    cursor: UUID | None = None,
    date: date | None = None,
    limit: int = Query(default=15, ge=1, le=15),
):
    rows = await get_prediction_history(pool, user_id, cursor, limit, date)
    return PredictionsHistoryResponse(
        predictions=[
            PredictionHistoryItem(
                prediction=prediction_item(row.prediction),
                match=match_item(row.match),
                scorer=player_item(row.scorer) if row.scorer else None,
            )
            for row in rows
        ],
        next_cursor=rows[-1].prediction.prediction_id if len(rows) == limit else None,
    )
