import asyncio

from asyncpg import Pool
from fastapi import FastAPI
import httpx

from src.app.config.settings import settings
from src.app.logging.logger_setup import get_logger
from src.logic.sports.api_football_client import ApiFootballClient
from src.logic.workers.helper.process_due_match_sync_jobs import process_due_match_sync_jobs
from src.logic.workers.helper.process_due_team_roster_sync_jobs import process_due_team_roster_sync_jobs
from src.logic.workers.helper.settle_due_matches import settle_due_matches
from src.logic.workers.helper.sports_sync_constants import INTERVAL_SECONDS
from src.logic.workers.helper.sync_fixtures_if_due import sync_fixtures_if_due
from src.store.sql.sports.ensure_match_sync_state import ensure_match_sync_state
from src.store.sql.sports.ensure_team_roster_sync_state import ensure_team_roster_sync_state
from src.store.sql.sports.lock_due_matches import lock_due_matches
from src.store.sql.sports.stop_settled_match_sync import stop_settled_match_sync

logger = get_logger(__name__)


async def sports_sync_cron(app: FastAPI, http: httpx.AsyncClient) -> None:
    while True:
        try:
            await run_sports_sync_once(app.state.psql_pool, http)
            await asyncio.sleep(INTERVAL_SECONDS)
        except asyncio.CancelledError:
            logger.info("sports_sync_cron_cancelled")
            break
        except Exception:
            logger.exception("sports_sync_cron_unexpected_error")
            await asyncio.sleep(INTERVAL_SECONDS)


async def run_sports_sync_once(pool: Pool, http: httpx.AsyncClient) -> None:
    if not settings.SPORTS_SYNC_ENABLED:
        return

    api = ApiFootballClient(http)
    async with pool.acquire() as conn:
        await lock_due_matches(conn)
        await ensure_match_sync_state(conn)
        await ensure_team_roster_sync_state(conn)

    if api.enabled:
        await process_due_match_sync_jobs(pool, api)
        await sync_fixtures_if_due(pool, api)
        await process_due_team_roster_sync_jobs(pool, api)

    await settle_due_matches(pool)
    async with pool.acquire() as conn:
        await stop_settled_match_sync(conn)
