from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def list_active_league_member_user_ids(conn: Connection, league_id: UUID) -> list[UUID]:
    rows = await conn.fetch(
        """
        SELECT user_id
        FROM league_members
        WHERE league_id = $1
          AND status = 'active'
        """,
        league_id,
    )
    return [row["user_id"] for row in rows]
