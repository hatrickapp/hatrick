from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_user_plan_and_active_hosted_count(conn: Connection, user_id: UUID) -> tuple[str, int] | None:
    user = await conn.fetchrow(
        """
        SELECT plan
        FROM users
        WHERE user_id = $1
          AND is_deleted = FALSE
        FOR UPDATE
        """,
        user_id,
    )
    if user is None:
        return None

    count = await conn.fetchval(
        """
        SELECT
            COUNT(l.league_id) FILTER (
                WHERE l.status IN ('active', 'paused', 'closed')
                  AND l.deleted_at IS NULL
            )::int AS active_hosted_count
        FROM leagues l
        WHERE l.host_user_id = $1
        """,
        user_id,
    )
    return user["plan"], int(count or 0)
