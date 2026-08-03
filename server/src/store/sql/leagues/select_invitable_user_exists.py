from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.sports.read_models import CompetitionRow

async def select_invitable_user_exists(conn: Connection, user_id: UUID) -> bool:
    return bool(
        await conn.fetchval(
            """
            SELECT 1
            FROM users
            WHERE user_id = $1
              AND is_deleted = FALSE
              AND username_setup_completed = TRUE
            """,
            user_id,
        )
    )
