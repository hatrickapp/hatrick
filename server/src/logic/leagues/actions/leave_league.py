from uuid import UUID

from asyncpg import Pool

from server.src.app.errors.domains.league_errors import LeagueFinishedError, LeagueMemberActionError, LeagueNotFoundError
from server.src.logic.leagues.actions.refresh_league_standings import refresh_league_standings
from server.src.store.sql.leagues.count_active_league_members import count_active_league_members
from server.src.store.sql.leagues.leave_league_member import leave_league_member
from server.src.store.sql.leagues.list_active_league_member_user_ids import list_active_league_member_user_ids
from server.src.store.sql.leagues.select_league_membership_state_for_update import select_league_membership_state_for_update

async def leave_league(pool: Pool, user_id: UUID, league_id: UUID) -> list[UUID]:
    async with pool.acquire() as conn:
        async with conn.transaction():
            league = await select_league_membership_state_for_update(conn, league_id)
            if league is None:
                raise LeagueNotFoundError()
            if league["status"] == "finished":
                raise LeagueFinishedError()
            if league["host_user_id"] == user_id:
                raise LeagueMemberActionError("HOST_LEAVE")

            active_count = await count_active_league_members(conn, league_id)
            if active_count <= 1:
                raise LeagueMemberActionError("LAST_MEMBER")
            if not await leave_league_member(conn, league_id, user_id):
                raise LeagueMemberActionError("MEMBER_NOT_FOUND")
            await refresh_league_standings(conn, league_id)
            member_user_ids = await list_active_league_member_user_ids(conn, league_id)
            return [*member_user_ids, user_id]
