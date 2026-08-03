from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_league_member_exists(conn: Connection, league_id: UUID, user_id: UUID) -> bool:
    return bool(
        await conn.fetchval(
            """
            SELECT 1
            FROM league_members
            WHERE league_id = $1
              AND user_id = $2
              AND status = 'active'
            """,
            league_id,
            user_id,
        )
    )
