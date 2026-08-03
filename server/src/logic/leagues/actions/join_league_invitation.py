from datetime import UTC, datetime
from uuid import UUID

from asyncpg import Pool

from server.src.app.errors.domains.league_errors import InvalidLeagueInviteError, LeagueAlreadyJoinedError, LeagueClosedError, LeagueFinishedError, LeagueFullError, LeagueNotFoundError
from server.src.logic.leagues.actions.refresh_league_standings import refresh_league_standings
from server.src.store.sql.leagues.cleanup_league_invitations_for_user import cleanup_league_invitations_for_user
from server.src.store.sql.leagues.count_active_league_members import count_active_league_members
from server.src.store.sql.leagues.delete_league_invitation import delete_league_invitation
from server.src.store.sql.leagues.insert_league_member import insert_league_member
from server.src.store.sql.leagues.list_active_league_member_user_ids import list_active_league_member_user_ids
from server.src.store.sql.leagues.read_models import LeagueRow
from server.src.store.sql.leagues.select_league_detail import select_league_detail
from server.src.store.sql.leagues.select_league_invitation_for_update import select_league_invitation_for_update
from server.src.store.sql.leagues.select_league_member_exists import select_league_member_exists
from server.src.store.sql.leagues.update_league_invitation_status import update_league_invitation_status

async def join_league_invitation(pool: Pool, user_id: UUID, league_invitation_id: UUID) -> tuple[LeagueRow, list[UUID]]:
    now = datetime.now(UTC)

    async with pool.acquire() as conn:
        async with conn.transaction():
            await cleanup_league_invitations_for_user(conn, user_id)
            invitation = await select_league_invitation_for_update(conn, league_invitation_id, user_id)
            if invitation is None:
                raise InvalidLeagueInviteError()
            if invitation["invitation_status"] != "pending":
                raise InvalidLeagueInviteError()
            if invitation["expires_at"] <= now or invitation["league_status"] == "deleted":
                await delete_league_invitation(conn, league_invitation_id)
                raise InvalidLeagueInviteError()
            if now >= invitation["ends_at"] and invitation["league_status"] != "finished":
                await refresh_league_standings(conn, invitation["league_id"])
                invitation = await select_league_invitation_for_update(conn, league_invitation_id, user_id)
                if invitation is None:
                    raise InvalidLeagueInviteError()
            if invitation["league_status"] == "finished":
                await delete_league_invitation(conn, league_invitation_id)
                raise LeagueFinishedError()
            if invitation["league_status"] != "active":
                raise LeagueClosedError()
            if await select_league_member_exists(conn, invitation["league_id"], user_id):
                await delete_league_invitation(conn, league_invitation_id)
                raise LeagueAlreadyJoinedError()
            if await count_active_league_members(conn, invitation["league_id"]) >= invitation["max_members"]:
                raise LeagueFullError()

            score_starts_at = invitation["starts_at"] if invitation["include_existing_points"] else now
            await insert_league_member(conn, invitation["league_id"], user_id, score_starts_at)
            await update_league_invitation_status(conn, league_invitation_id, "accepted")
            await refresh_league_standings(conn, invitation["league_id"])
            member_user_ids = await list_active_league_member_user_ids(conn, invitation["league_id"])

            detail = await select_league_detail(conn, invitation["league_id"], user_id)
            if detail is None:
                raise LeagueNotFoundError()
            return detail, member_user_ids
