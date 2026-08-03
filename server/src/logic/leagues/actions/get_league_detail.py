from uuid import UUID

from asyncpg import Pool

from server.src.app.errors.domains.league_errors import LeagueNotFoundError
from server.src.store.sql.leagues.read_models import LeagueRow
from server.src.store.sql.leagues.select_league_detail import select_league_detail

async def get_league_detail(pool: Pool, user_id: UUID, league_id: UUID) -> LeagueRow:
    async with pool.acquire() as conn:
        league = await select_league_detail(conn, league_id, user_id)
        if league is None:
            raise LeagueNotFoundError()
        return league
