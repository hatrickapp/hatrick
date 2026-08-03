from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def cleanup_league_invitations_for_user(conn: Connection, invited_user_id: UUID) -> None:
    await conn.execute(
        """
        DELETE FROM league_invitations li
        USING leagues l
        WHERE li.league_id = l.league_id
          AND li.invited_user_id = $1
          AND li.status = 'pending'
          AND (
            li.expires_at <= NOW()
            OR l.status IN ('deleted', 'finished')
          )
        """,
        invited_user_id,
    )
    await conn.execute(
        """
        UPDATE league_invitations li
        SET status = 'accepted',
            responded_at = COALESCE(li.responded_at, NOW()),
            updated_at = NOW()
        WHERE li.invited_user_id = $1
          AND li.status = 'pending'
          AND EXISTS (
            SELECT 1
            FROM league_members lm
            WHERE lm.league_id = li.league_id
              AND lm.user_id = li.invited_user_id
              AND lm.status = 'active'
          )
        """,
        invited_user_id,
    )
    await conn.execute(
        """
        DELETE FROM league_invitations li
        USING leagues l
        WHERE li.league_id = l.league_id
          AND li.invited_user_id = $1
          AND li.status != 'pending'
          AND l.status IN ('deleted', 'finished')
        """,
        invited_user_id,
    )
