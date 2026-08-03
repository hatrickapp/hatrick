from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.sports.read_models import CompetitionRow

async def select_league_host_state(conn: Connection, league_id: UUID, host_user_id: UUID) -> str | None:
    return await conn.fetchval(
        """
        SELECT status
        FROM leagues
        WHERE league_id = $1
          AND host_user_id = $2
          AND status != 'deleted'
        """,
        league_id,
        host_user_id,
    )
