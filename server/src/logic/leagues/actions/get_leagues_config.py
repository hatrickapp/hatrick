from asyncpg import Pool

from src.app.errors.domains.league_errors import InvalidLeagueSettingsError
from src.store.sql.app_config.select_all_plan_limits import select_all_plan_limits
from src.store.sql.app_config.select_league_limits import select_league_limits
from src.store.sql.app_config.select_league_scoring_presets import select_league_scoring_presets
from src.store.sql.app_config.select_plus_offering import select_plus_offering

async def get_leagues_config(pool: Pool):
    async with pool.acquire() as conn:
        plan_limits = await select_all_plan_limits(conn)
        league_limits = await select_league_limits(conn)
        plus_offering = await select_plus_offering(conn)
        scoring_presets = await select_league_scoring_presets(conn)
        if league_limits is None or plus_offering is None or not plan_limits or not scoring_presets:
            raise InvalidLeagueSettingsError("APP_CONFIG_MISSING")
        return plan_limits, league_limits, plus_offering, scoring_presets
