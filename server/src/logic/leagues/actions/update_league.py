from datetime import datetime
from uuid import UUID

from asyncpg import Pool

from src.app.errors.domains.league_errors import InvalidLeagueSettingsError, LeagueFinishedError, LeagueNotFoundError, LeaguePermissionError
from src.app.validation.validate_league import validate_league_end_update
from src.store.sql.app_config.select_league_limits import select_league_limits
from src.store.sql.leagues.read_models import LeagueRow
from src.store.sql.leagues.select_league_host_state import select_league_host_state
from src.store.sql.leagues.update_league_settings import update_league_settings

async def update_league(
    pool: Pool,
    user_id: UUID,
    league_id: UUID,
    ends_at: datetime | None,
    status: str | None,
) -> LeagueRow:
    if status is not None and status not in {"active", "paused", "closed", "deleted"}:
        raise InvalidLeagueSettingsError("INVALID_STATUS")

    async with pool.acquire() as conn:
        async with conn.transaction():
            if ends_at is not None:
                league_limits = await select_league_limits(conn)
                if league_limits is None:
                    raise InvalidLeagueSettingsError("APP_CONFIG_MISSING")
                ok, reason = validate_league_end_update(ends_at, league_limits["max_period_days"])
                if not ok:
                    raise InvalidLeagueSettingsError(reason)
            current_status = await select_league_host_state(conn, league_id, user_id)
            if current_status is None:
                raise LeagueNotFoundError()
            if current_status == "finished":
                raise LeagueFinishedError()

            updated = await update_league_settings(conn, league_id, user_id, ends_at, status)
            if updated is None:
                raise LeaguePermissionError()
            return updated
