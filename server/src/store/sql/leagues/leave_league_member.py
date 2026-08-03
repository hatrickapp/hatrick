from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def leave_league_member(conn: Connection, league_id: UUID, user_id: UUID) -> bool:
    row = await conn.fetchrow(
        """
        UPDATE league_members
        SET status = 'left',
            left_at = NOW()
        WHERE league_id = $1
          AND user_id = $2
          AND status = 'active'
        RETURNING league_member_id
        """,
        league_id,
        user_id,
    )
    return row is not None
