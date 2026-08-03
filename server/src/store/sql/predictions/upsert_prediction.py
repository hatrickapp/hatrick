from uuid import UUID, uuid7

from asyncpg import Connection

from src.app.errors.domains.sports_errors import InvalidPredictionPlayerError, MatchNotFoundError, PredictionLockedError
from src.store.sql.sports.map_prediction import map_prediction
from src.store.sql.sports.read_models import PredictionRow

async def upsert_prediction(
    conn: Connection,
    user_id: UUID,
    match_id: UUID,
    outcome_pick: str,
    btts_pick: bool,
    scorer_player_id: UUID,
) -> PredictionRow:
    query = """
    WITH state AS (
        SELECT
            EXISTS (
                SELECT 1
                FROM matches
                WHERE match_id = $2
            ) AS match_exists,
            COALESCE((
                SELECT is_locked
                    OR is_settled
                    OR is_void
                    OR NOW() >= kickoff_at - INTERVAL '5 minutes'
                FROM matches
                WHERE match_id = $2
            ), FALSE) AS prediction_locked,
            EXISTS (
                SELECT 1
                FROM match_player_pool
                WHERE match_id = $2
                  AND player_id = $5
                  AND is_available = TRUE
            ) AS player_available
    ),
    upserted AS (
        INSERT INTO predictions (
            prediction_id,
            user_id,
            match_id,
            outcome_pick,
            btts_pick,
            scorer_player_id,
            status
        )
        SELECT
            $6,
            $1,
            $2,
            $3,
            $4,
            $5,
            'open'
        FROM state
        WHERE match_exists = TRUE
          AND prediction_locked = FALSE
          AND player_available = TRUE
        ON CONFLICT (user_id, match_id)
        DO UPDATE SET
            outcome_pick = EXCLUDED.outcome_pick,
            btts_pick = EXCLUDED.btts_pick,
            scorer_player_id = EXCLUDED.scorer_player_id,
            status = 'open',
            outcome_correct = NULL,
            btts_correct = NULL,
            scorer_correct = NULL,
            hatrick_bonus_awarded = FALSE,
            points = 0,
            settled_at = NULL,
            updated_at = NOW()
        RETURNING
            prediction_id,
            outcome_pick,
            btts_pick,
            scorer_player_id,
            status AS prediction_status,
            points,
            outcome_correct,
            btts_correct,
            scorer_correct,
            hatrick_bonus_awarded,
            created_at AS prediction_created_at,
            updated_at AS prediction_updated_at
    ),
    revision AS (
        INSERT INTO prediction_revisions (
            revision_id,
            prediction_id,
            user_id,
            match_id,
            outcome_pick,
            btts_pick,
            scorer_player_id
        )
        SELECT
            $7,
            prediction_id,
            $1,
            $2,
            outcome_pick,
            btts_pick,
            scorer_player_id
        FROM upserted
        RETURNING revision_id
    )
    SELECT
        state.match_exists,
        state.prediction_locked,
        state.player_available,
        upserted.prediction_id,
        upserted.outcome_pick,
        upserted.btts_pick,
        upserted.scorer_player_id,
        upserted.prediction_status,
        upserted.points,
        upserted.outcome_correct,
        upserted.btts_correct,
        upserted.scorer_correct,
        upserted.hatrick_bonus_awarded,
        upserted.prediction_created_at,
        upserted.prediction_updated_at
    FROM state
    LEFT JOIN upserted ON TRUE
    LEFT JOIN revision ON TRUE
    """
    row = await conn.fetchrow(
        query,
        user_id,
        match_id,
        outcome_pick,
        btts_pick,
        scorer_player_id,
        uuid7(),
        uuid7(),
    )
    if row is None or not row["match_exists"]:
        raise MatchNotFoundError()
    if row["prediction_locked"]:
        raise PredictionLockedError()
    if not row["player_available"]:
        raise InvalidPredictionPlayerError()
    prediction = map_prediction(row)
    if prediction is None:
        raise MatchNotFoundError()
    return prediction
