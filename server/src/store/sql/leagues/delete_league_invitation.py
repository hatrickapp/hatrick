from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def delete_league_invitation(conn: Connection, league_invitation_id: UUID) -> None:
    await conn.execute(
        """
        DELETE FROM league_invitations
        WHERE league_invitation_id = $1
        """,
        league_invitation_id,
    )
