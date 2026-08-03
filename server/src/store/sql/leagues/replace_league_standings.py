from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def replace_league_standings(conn: Connection, league_id: UUID, standings: list[LeagueScoredStanding]) -> None:
    user_ids = [standing.user_id for standing in standings]
    await conn.execute(
        """
        DELETE FROM league_standings
        WHERE league_id = $1
          AND NOT (user_id = ANY($2::uuid[]))
        """,
        league_id,
        user_ids,
    )
    if not standings:
        return

    await conn.execute(
        """
        INSERT INTO league_standings (
            league_id,
            user_id,
            rank,
            points,
            predictions_count,
            correct_outcomes,
            correct_btts,
            correct_scorers,
            hatricks,
            updated_at
        )
        SELECT
            $1::uuid,
            payload.user_id,
            payload.rank,
            payload.points,
            payload.predictions_count,
            payload.correct_outcomes,
            payload.correct_btts,
            payload.correct_scorers,
            payload.hatricks,
            NOW()
        FROM UNNEST(
            $2::uuid[],
            $3::int[],
            $4::int[],
            $5::int[],
            $6::int[],
            $7::int[],
            $8::int[],
            $9::int[]
        ) AS payload(
            user_id,
            rank,
            points,
            predictions_count,
            correct_outcomes,
            correct_btts,
            correct_scorers,
            hatricks
        )
        ON CONFLICT (league_id, user_id) DO UPDATE
        SET rank = EXCLUDED.rank,
            points = EXCLUDED.points,
            predictions_count = EXCLUDED.predictions_count,
            correct_outcomes = EXCLUDED.correct_outcomes,
            correct_btts = EXCLUDED.correct_btts,
            correct_scorers = EXCLUDED.correct_scorers,
            hatricks = EXCLUDED.hatricks,
            updated_at = NOW()
        """,
        league_id,
        user_ids,
        [standing.rank for standing in standings],
        [standing.points for standing in standings],
        [standing.predictions_count for standing in standings],
        [standing.correct_outcomes for standing in standings],
        [standing.correct_btts for standing in standings],
        [standing.correct_scorers for standing in standings],
        [standing.hatricks for standing in standings],
    )
