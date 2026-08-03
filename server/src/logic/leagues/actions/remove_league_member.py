from uuid import UUID

from asyncpg import Pool

from src.app.errors.domains.league_errors import LeagueFinishedError, LeagueMemberActionError, LeagueNotFoundError, LeaguePermissionError
from src.logic.leagues.actions.refresh_league_standings import refresh_league_standings
from src.store.sql.leagues.count_active_league_members import count_active_league_members
from src.store.sql.leagues.leave_league_member import leave_league_member
from src.store.sql.leagues.list_active_league_member_user_ids import list_active_league_member_user_ids
from src.store.sql.leagues.read_models import LeagueRow
from src.store.sql.leagues.select_league_detail import select_league_detail
from src.store.sql.leagues.select_league_membership_state_for_update import select_league_membership_state_for_update

async def remove_league_member(pool: Pool, host_user_id: UUID, league_id: UUID, member_user_id: UUID) -> tuple[LeagueRow, list[UUID]]:
    if host_user_id == member_user_id:
        raise LeagueMemberActionError("REMOVE_SELF")

    async with pool.acquire() as conn:
        async with conn.transaction():
            league = await select_league_membership_state_for_update(conn, league_id)
            if league is None:
                raise LeagueNotFoundError()
            if league["status"] == "finished":
                raise LeagueFinishedError()
            if league["host_user_id"] != host_user_id:
                raise LeaguePermissionError()

            active_count = await count_active_league_members(conn, league_id)
            if active_count <= 1:
                raise LeagueMemberActionError("LAST_MEMBER")
            if not await leave_league_member(conn, league_id, member_user_id):
                raise LeagueMemberActionError("MEMBER_NOT_FOUND")
            await refresh_league_standings(conn, league_id)
            member_user_ids = await list_active_league_member_user_ids(conn, league_id)

            detail = await select_league_detail(conn, league_id, host_user_id)
            if detail is None:
                raise LeagueNotFoundError()
            return detail, [*member_user_ids, member_user_id]
