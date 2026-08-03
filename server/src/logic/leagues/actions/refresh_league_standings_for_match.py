from uuid import UUID

from src.logic.leagues.actions.refresh_league_standings import refresh_league_standings
from src.store.sql.leagues.select_leagues_for_match import select_leagues_for_match

async def refresh_league_standings_for_match(conn, match_id: UUID) -> None:
    for league_id in await select_leagues_for_match(conn, match_id):
        await refresh_league_standings(conn, league_id)
