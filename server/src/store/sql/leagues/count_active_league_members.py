from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def count_active_league_members(conn: Connection, league_id: UUID) -> int:
    return int(
        await conn.fetchval(
            """
            SELECT COUNT(*)::int
            FROM league_members
            WHERE league_id = $1
              AND status = 'active'
            """,
            league_id,
        )
        or 0
    )
