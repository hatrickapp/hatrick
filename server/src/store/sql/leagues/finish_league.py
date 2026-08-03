from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def finish_league(conn: Connection, league_id: UUID, winner_user_id: UUID | None) -> None:
    await conn.execute(
        """
        UPDATE leagues
        SET status = 'finished',
            winner_user_id = $2,
            finished_at = NOW(),
            updated_at = NOW()
        WHERE league_id = $1
          AND status NOT IN ('finished', 'deleted')
        """,
        league_id,
        winner_user_id,
    )
