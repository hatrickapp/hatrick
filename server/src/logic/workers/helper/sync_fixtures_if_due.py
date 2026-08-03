from datetime import datetime, timezone

from asyncpg import Pool
import orjson

from src.app.logging.logger_setup import get_logger
from src.logic.sports.api_football_client import ApiFootballClient, ApiFootballError
from src.logic.workers.helper.sports_sync_constants import FIXTURE_SYNC_SECONDS, FIXTURE_SYNC_TYPE
from src.store.sql.sports.ensure_match_sync_state import ensure_match_sync_state
from src.store.sql.sports.ensure_team_roster_sync_state import ensure_team_roster_sync_state
from src.store.sql.sports.get_enabled_competitions import get_enabled_competitions
from src.store.sql.sports.record_sync_finish import record_sync_finish
from src.store.sql.sports.record_sync_start import record_sync_start
from src.store.sql.sports.should_run_sync import should_run_sync
from src.store.sql.sports.upsert_match_fixture import upsert_match_fixture

logger = get_logger(__name__)

async def sync_fixtures_if_due(pool: Pool, api: ApiFootballClient) -> None:
    async with pool.acquire() as conn:
        if not await should_run_sync(conn, FIXTURE_SYNC_TYPE, FIXTURE_SYNC_SECONDS):
            return
        sync_run_id = await record_sync_start(conn, FIXTURE_SYNC_TYPE)

    total = 0
    status = "success"
    today = datetime.now(timezone.utc).date()
    error_message = None
    sync_errors: list[str] = []
    try:
        async with pool.acquire() as conn:
            competitions = await get_enabled_competitions(conn)
        enabled_league_ids = {competition["provider_league_id"] for competition in competitions}
        try:
            fixtures = await api.fixtures_by_date(today)
        except ApiFootballError as exc:
            sync_errors.append(str(exc))
            fixtures = []
        async with pool.acquire() as conn:
            for fixture in fixtures:
                league = fixture.get("league") or {}
                if league.get("id") not in enabled_league_ids:
                    continue
                try:
                    match_id = await upsert_match_fixture(conn, fixture)
                except Exception as exc:
                    fixture = fixture.get("fixture") or {}
                    sync_errors.append(f"fixture {fixture.get('id')}: {exc}")
                    logger.warning("sports_fixture_upsert_failed", extra={"provider_fixture_id": fixture.get("id")})
                    continue
                if match_id:
                    total += 1
    except Exception as exc:
        logger.exception("sports_fixture_sync_failed")
        status = "failed"
        error_message = str(exc)
    finally:
        if status == "failed" and total > 0:
            status = "success"
        elif status == "success" and total == 0 and sync_errors:
            status = "failed"
            error_message = sync_errors[0]
        async with pool.acquire() as conn:
            details = orjson.dumps({"fixtures": total, "error": error_message, "sync_errors": sync_errors}).decode()
            await record_sync_finish(conn, sync_run_id, status, details)
            await ensure_match_sync_state(conn)
            await ensure_team_roster_sync_state(conn)
