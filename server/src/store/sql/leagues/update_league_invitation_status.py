from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def update_league_invitation_status(conn: Connection, league_invitation_id: UUID, status: str) -> None:
    await conn.execute(
        """
        UPDATE league_invitations
        SET status = $2,
            responded_at = NOW(),
            updated_at = NOW()
        WHERE league_invitation_id = $1
        """,
        league_invitation_id,
        status,
    )
