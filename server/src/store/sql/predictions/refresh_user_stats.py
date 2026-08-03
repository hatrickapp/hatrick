from uuid import UUID

from asyncpg import Connection

from src.logic.predictions.scoring import score_prediction

async def refresh_user_stats(conn: Connection, user_id: UUID) -> None:
    query = """
    INSERT INTO user_stats (
        user_id,
        total_points,
        predictions_count,
        settled_predictions,
        correct_outcomes,
        correct_btts,
        correct_scorers,
        hatricks,
        updated_at
    )
    SELECT
        $1,
        COALESCE(SUM(points), 0)::int,
        COUNT(*)::int,
        COUNT(*) FILTER (WHERE status = 'settled')::int,
        COUNT(*) FILTER (WHERE outcome_correct = TRUE)::int,
        COUNT(*) FILTER (WHERE btts_correct = TRUE)::int,
        COUNT(*) FILTER (WHERE scorer_correct = TRUE)::int,
        COUNT(*) FILTER (WHERE hatrick_bonus_awarded = TRUE)::int,
        NOW()
    FROM predictions
    WHERE user_id = $1
    ON CONFLICT (user_id) DO UPDATE
    SET total_points = EXCLUDED.total_points,
        predictions_count = EXCLUDED.predictions_count,
        settled_predictions = EXCLUDED.settled_predictions,
        correct_outcomes = EXCLUDED.correct_outcomes,
        correct_btts = EXCLUDED.correct_btts,
        correct_scorers = EXCLUDED.correct_scorers,
        hatricks = EXCLUDED.hatricks,
        updated_at = NOW()
    """
    await conn.execute(query, user_id)
