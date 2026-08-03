from dataclasses import dataclass
from datetime import date, datetime, timezone
from uuid import UUID

from asyncpg import Pool

from src.logic.predictions.date_window import local_date_window
from src.store.sql.predictions.list_prediction_history import list_prediction_history
from src.store.sql.predictions.upsert_prediction import upsert_prediction
from src.store.sql.sports.read_models import PredictionHistoryRow, PredictionRow
from src.store.sql.sports.select_user_timezone import select_user_timezone

@dataclass(frozen=True)
class RankingAccuracy:
    key: str
    label: str
    correct: int
    total: int
    ratio_percent: float


async def save_prediction(
    pool: Pool,
    user_id: UUID,
    match_id: UUID,
    outcome_pick: str,
    btts_pick: bool,
    scorer_player_id: UUID,
) -> PredictionRow:
    async with pool.acquire() as conn:
        async with conn.transaction():
            return await upsert_prediction(conn, user_id, match_id, outcome_pick, btts_pick, scorer_player_id)


async def get_prediction_history(
    pool: Pool,
    user_id: UUID,
    cursor: UUID | None,
    limit: int,
    match_date: date | None = None,
) -> list[PredictionHistoryRow]:
    capped_limit = min(max(limit, 1), 15)
    async with pool.acquire() as conn:
        start_at = end_at = None
        if match_date is not None:
            timezone_name = await select_user_timezone(conn, user_id)
            start_at, end_at = local_date_window(datetime.now(timezone.utc), timezone_name, match_date)
        return await list_prediction_history(conn, user_id, cursor, capped_limit, start_at, end_at)


def ranking_rules() -> list[str]:
    return [
        "Total settled points decide the ranking first.",
        "If points are tied, users with more Hatricks rank higher.",
        "If still tied, users with more correct scorers rank higher.",
    ]


def ranking_accuracy_rows(settled_predictions: int, correct_outcomes: int, correct_btts: int, correct_scorers: int, hatricks: int) -> list[RankingAccuracy]:
    return [
        accuracy_row("winner_draw", "Winners", correct_outcomes, settled_predictions),
        accuracy_row("btts", "Both To Score", correct_btts, settled_predictions),
        accuracy_row("scorer", "Scorers", correct_scorers, settled_predictions),
        accuracy_row("hatrick", "Hatricks", hatricks, settled_predictions),
    ]


def accuracy_row(key: str, label: str, correct: int, total: int) -> RankingAccuracy:
    ratio = round((correct / total) * 100, 2) if total else 0.0
    return RankingAccuracy(key=key, label=label, correct=correct, total=total, ratio_percent=ratio)
