from uuid import UUID

from asyncpg import Pool

from server.src.app.errors.domains.league_errors import InvalidLeagueInviteError, LeagueAlreadyJoinedError, LeagueFinishedError, LeagueMemberActionError, LeagueNotFoundError, LeaguePermissionError
from server.src.store.sql.leagues.list_active_league_member_user_ids import list_active_league_member_user_ids
from server.src.store.sql.leagues.list_league_invitations import list_league_invitations
from server.src.store.sql.leagues.read_models import LeagueInvitationRow
from server.src.store.sql.leagues.select_invitable_user_exists import select_invitable_user_exists
from server.src.store.sql.leagues.select_league_member_exists import select_league_member_exists
from server.src.store.sql.leagues.select_league_membership_state_for_update import select_league_membership_state_for_update
from server.src.store.sql.leagues.upsert_league_invitation import upsert_league_invitation

async def invite_user_to_league(pool: Pool, host_user_id: UUID, league_id: UUID, invited_user_id: UUID) -> tuple[LeagueInvitationRow, list[UUID]]:
    if host_user_id == invited_user_id:
        raise LeagueMemberActionError("SELF_INVITE")

    async with pool.acquire() as conn:
        async with conn.transaction():
            league = await select_league_membership_state_for_update(conn, league_id)
            if league is None:
                raise LeagueNotFoundError()
            if league["host_user_id"] != host_user_id:
                raise LeaguePermissionError()
            if league["status"] == "finished":
                raise LeagueFinishedError()
            if not await select_invitable_user_exists(conn, invited_user_id):
                raise InvalidLeagueInviteError()
            if await select_league_member_exists(conn, league_id, invited_user_id):
                raise LeagueAlreadyJoinedError()
            await upsert_league_invitation(conn, league_id, invited_user_id, host_user_id)
            member_user_ids = await list_active_league_member_user_ids(conn, league_id)
            invitations = await list_league_invitations(conn, invited_user_id)
            for invitation in invitations:
                if invitation.league.league_id == league_id and invitation.status == "pending":
                    return invitation, member_user_ids
            raise InvalidLeagueInviteError()
