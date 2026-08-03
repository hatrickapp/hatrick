from asyncpg import Record

from server.src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def map_prediction(row: Record) -> PredictionRow | None:
    if row["prediction_id"] is None:
        return None
    return PredictionRow(
        prediction_id=row["prediction_id"],
        outcome_pick=row["outcome_pick"],
        btts_pick=row["btts_pick"],
        scorer_player_id=row["scorer_player_id"],
        status=row["prediction_status"],
        points=row["points"],
        outcome_correct=row["outcome_correct"],
        btts_correct=row["btts_correct"],
        scorer_correct=row["scorer_correct"],
        hatrick_bonus_awarded=row["hatrick_bonus_awarded"],
        created_at=row["prediction_created_at"],
        updated_at=row["prediction_updated_at"],
    )
