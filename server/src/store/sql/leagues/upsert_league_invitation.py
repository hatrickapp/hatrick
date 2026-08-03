from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def upsert_league_invitation(conn: Connection, league_id: UUID, invited_user_id: UUID, invited_by_user_id: UUID):
    return await conn.fetchrow(
        """
        INSERT INTO league_invitations (
            league_invitation_id,
            league_id,
            invited_user_id,
            invited_by_user_id
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (league_id, invited_user_id) WHERE status = 'pending' DO UPDATE
        SET invited_by_user_id = EXCLUDED.invited_by_user_id,
            status = 'pending',
            responded_at = NULL,
            created_at = NOW(),
            expires_at = NOW() + INTERVAL '7 days',
            updated_at = NOW()
        RETURNING league_invitation_id
        """,
        uuid7(),
        league_id,
        invited_user_id,
        invited_by_user_id,
    )
