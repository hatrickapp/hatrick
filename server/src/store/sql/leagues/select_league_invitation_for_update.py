from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_league_invitation_for_update(conn: Connection, league_invitation_id: UUID, invited_user_id: UUID):
    return await conn.fetchrow(
        """
        SELECT li.*, li.status AS invitation_status, l.*, l.status AS league_status
        FROM league_invitations li
        JOIN leagues l ON l.league_id = li.league_id
        WHERE li.league_invitation_id = $1
          AND li.invited_user_id = $2
        FOR UPDATE OF li, l
        """,
        league_invitation_id,
        invited_user_id,
    )
