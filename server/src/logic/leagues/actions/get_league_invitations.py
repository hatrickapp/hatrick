from uuid import UUID

from asyncpg import Pool

from src.store.sql.leagues.list_league_invitations import list_league_invitations
from src.store.sql.leagues.read_models import LeagueInvitationRow

async def get_league_invitations(pool: Pool, user_id: UUID) -> list[LeagueInvitationRow]:
    async with pool.acquire() as conn:
        return await list_league_invitations(conn, user_id)
