from datetime import datetime, timezone
from typing import Any

from asyncpg import Pool

from src.app.logging.logger_setup import get_logger
from src.logic.sports.api_football_client import ApiFootballClient, ApiFootballError
from src.logic.workers.helper.apply_events_for_match import apply_events_for_match
from src.logic.workers.helper.sports_sync_constants import SCHEDULED_STATUSES
from src.logic.workers.helper.sports_sync_schedule import is_rate_limit_error, next_match_schedule, rate_limit_retry_delay, retry_boundary, should_skip_single_fixture_lookup_after_live_batch, should_sync_events, should_use_live_fixture_batch, unmatched_live_batch_schedule
from src.store.sql.sports.claim_due_match_sync_jobs import claim_due_match_sync_jobs
from src.store.sql.sports.complete_match_sync_job import complete_match_sync_job
from src.store.sql.sports.release_match_sync_job import release_match_sync_job
from src.store.sql.sports.upsert_match_fixture import upsert_match_fixture

logger = get_logger(__name__)

async def process_due_match_sync_jobs(pool: Pool, api: ApiFootballClient) -> None:
    async with pool.acquire() as conn:
        jobs = await claim_due_match_sync_jobs(conn)

    if not jobs:
        return

    now = datetime.now(timezone.utc)
    live_candidate_ids = {job.provider_fixture_id for job in jobs if should_use_live_fixture_batch(job, now)}
    live_payloads_by_fixture_id: dict[int, dict[str, Any]] = {}
    if live_candidate_ids:
        try:
            live_payloads = await api.live_fixtures()
            live_payloads_by_fixture_id = {
                fixture_id: payload
                for payload in live_payloads
                if (fixture_id := ((payload.get("fixture") or {}).get("id"))) in live_candidate_ids
            }
            logger.info(
                "sports_live_fixtures_batch_synced",
                extra={
                    "candidate_count": len(live_candidate_ids),
                    "matched_count": len(live_payloads_by_fixture_id),
                },
            )
        except ApiFootballError as exc:
            logger.warning("sports_live_fixtures_batch_skipped", extra={"error": str(exc)})
            if is_rate_limit_error(exc):
                async with pool.acquire() as conn:
                    for job in jobs:
                        if job.provider_fixture_id in live_candidate_ids:
                            await release_match_sync_job(conn, job.match_id, retry_boundary(now, rate_limit_retry_delay(exc)), str(exc))
                return
            live_candidate_ids = set()

    for job in jobs:
        now = datetime.now(timezone.utc)
        batched_payload = live_payloads_by_fixture_id.get(job.provider_fixture_id)
        if batched_payload is not None:
            fixture_payloads = [batched_payload]
        elif should_skip_single_fixture_lookup_after_live_batch(job, now):
            stage, next_sync_at = unmatched_live_batch_schedule(now)
            async with pool.acquire() as conn:
                await complete_match_sync_job(
                    conn,
                    job.match_id,
                    stage,
                    next_sync_at,
                    job.status,
                    fixture_synced=False,
                    final_synced=False,
                    stop=False,
                )
            continue
        else:
            try:
                fixture_payloads = await api.fixture(job.provider_fixture_id)
            except ApiFootballError as exc:
                async with pool.acquire() as conn:
                    await release_match_sync_job(conn, job.match_id, retry_boundary(now, rate_limit_retry_delay(exc)), str(exc))
                logger.warning("sports_match_fixture_sync_skipped", extra={"provider_fixture_id": job.provider_fixture_id, "error": str(exc)})
                if is_rate_limit_error(exc):
                    break
                continue

        current_status = job.status
        async with pool.acquire() as conn:
            async with conn.transaction():
                for payload in fixture_payloads:
                    await upsert_match_fixture(conn, payload)
                    fixture_status = (payload.get("fixture") or {}).get("status") or {}
                    current_status = fixture_status.get("short") or current_status

        events_synced = False

        if current_status not in SCHEDULED_STATUSES:
            if should_sync_events(job, current_status, now):
                try:
                    events = await api.events(job.provider_fixture_id)
                    async with pool.acquire() as conn:
                        async with conn.transaction():
                            await apply_events_for_match(conn, job.match_id, events)
                    events_synced = True
                except ApiFootballError as exc:
                    async with pool.acquire() as conn:
                        await release_match_sync_job(conn, job.match_id, retry_boundary(now, rate_limit_retry_delay(exc)), str(exc))
                    logger.warning("sports_events_sync_skipped", extra={"provider_fixture_id": job.provider_fixture_id, "error": str(exc)})
                    if is_rate_limit_error(exc):
                        break
                    continue

        stage, next_sync_at, final_synced = next_match_schedule(job, current_status, now, events_synced)
        async with pool.acquire() as conn:
            await complete_match_sync_job(
                conn,
                job.match_id,
                stage,
                next_sync_at,
                current_status,
                fixture_synced=True,
                events_synced=events_synced,
                final_synced=final_synced,
                stop=False,
            )
