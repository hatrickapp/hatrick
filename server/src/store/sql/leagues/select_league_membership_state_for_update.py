from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_league_membership_state_for_update(conn: Connection, league_id: UUID):
    return await conn.fetchrow(
        """
        SELECT league_id, host_user_id, status
        FROM leagues
        WHERE league_id = $1
          AND status != 'deleted'
        FOR UPDATE
        """,
        league_id,
    )
