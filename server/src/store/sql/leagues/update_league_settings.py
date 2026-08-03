from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.leagues.select_league_detail import select_league_detail
from src.store.sql.sports.read_models import CompetitionRow

async def update_league_settings(
    conn: Connection,
    league_id: UUID,
    host_user_id: UUID,
    ends_at: datetime | None,
    status: str | None,
) -> LeagueRow | None:
    league_before_delete = await select_league_detail(conn, league_id, host_user_id) if status == "deleted" else None
    row = await conn.fetchrow(
        """
        UPDATE leagues
        SET
            ends_at = COALESCE($3, ends_at),
            status = CASE
                WHEN $4 = 'deleted' THEN 'deleted'
                WHEN $4 IS NOT NULL THEN $4
                ELSE status
            END,
            deleted_at = CASE WHEN $4 = 'deleted' THEN NOW() ELSE deleted_at END,
            updated_at = NOW()
        WHERE league_id = $1
          AND host_user_id = $2
          AND status NOT IN ('finished', 'deleted')
        RETURNING league_id
        """,
        league_id,
        host_user_id,
        ends_at,
        status,
    )
    if row is None:
        return None
    if status == "deleted":
        if league_before_delete is None:
            return None
        league_before_delete.status = "deleted"
        return league_before_delete
    return await select_league_detail(conn, league_id, host_user_id)
