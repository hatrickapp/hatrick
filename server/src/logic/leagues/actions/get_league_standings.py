from uuid import UUID

from asyncpg import Pool

from server.src.app.errors.domains.league_errors import LeagueNotFoundError
from server.src.store.sql.leagues.list_league_standings import list_league_standings
from server.src.store.sql.leagues.read_models import LeagueStandingRow
from server.src.store.sql.leagues.select_league_detail import select_league_detail

async def get_league_standings(pool: Pool, user_id: UUID, league_id: UUID, cursor: UUID | None, limit: int) -> list[LeagueStandingRow]:
    capped_limit = min(max(limit, 1), 30)
    async with pool.acquire() as conn:
        if await select_league_detail(conn, league_id, user_id) is None:
            raise LeagueNotFoundError()
        return await list_league_standings(conn, league_id, user_id, cursor, capped_limit)
