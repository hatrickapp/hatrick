from uuid import UUID

from asyncpg import Pool

from server.src.store.sql.leagues.list_user_leagues import list_user_leagues
from server.src.store.sql.leagues.read_models import LeagueRow

async def get_leagues_home(pool: Pool, user_id: UUID) -> tuple[list[LeagueRow], list[LeagueRow]]:
    async with pool.acquire() as conn:
        active, history = await list_user_leagues(conn, user_id)
        return active, history
