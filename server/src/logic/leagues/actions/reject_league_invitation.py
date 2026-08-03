from uuid import UUID

from asyncpg import Pool

from src.app.errors.domains.league_errors import InvalidLeagueInviteError
from src.store.sql.leagues.cleanup_league_invitations_for_user import cleanup_league_invitations_for_user
from src.store.sql.leagues.select_league_invitation_for_update import select_league_invitation_for_update
from src.store.sql.leagues.update_league_invitation_status import update_league_invitation_status

async def reject_league_invitation(pool: Pool, user_id: UUID, league_invitation_id: UUID) -> None:
    async with pool.acquire() as conn:
        async with conn.transaction():
            await cleanup_league_invitations_for_user(conn, user_id)
            invitation = await select_league_invitation_for_update(conn, league_invitation_id, user_id)
            if invitation is None:
                raise InvalidLeagueInviteError()
            if invitation["invitation_status"] == "accepted":
                raise InvalidLeagueInviteError()
            if invitation["invitation_status"] != "rejected":
                await update_league_invitation_status(conn, league_invitation_id, "rejected")
