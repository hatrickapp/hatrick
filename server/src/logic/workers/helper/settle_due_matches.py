from asyncpg import Pool

from server.src.logic.leagues.actions.refresh_league_standings_for_match import refresh_league_standings_for_match
from server.src.store.sql.predictions.refresh_user_stats import refresh_user_stats
from server.src.store.sql.predictions.settle_match_predictions import settle_match_predictions
from server.src.store.sql.sports.select_settleable_matches import select_settleable_matches
from server.src.store.sql.sports.users_for_match_predictions import users_for_match_predictions

async def settle_due_matches(pool: Pool) -> None:
    async with pool.acquire() as conn:
        settleable = await select_settleable_matches(conn)

    for match_id in settleable:
        async with pool.acquire() as conn:
            async with conn.transaction():
                users = await users_for_match_predictions(conn, match_id)
                await settle_match_predictions(conn, match_id)
                for user in users:
                    await refresh_user_stats(conn, user["user_id"])
                await refresh_league_standings_for_match(conn, match_id)
