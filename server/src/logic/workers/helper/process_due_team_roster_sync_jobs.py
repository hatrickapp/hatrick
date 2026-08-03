from datetime import datetime, timezone

from asyncpg import Pool

from server.src.logic.sports.api_football_client import ApiFootballClient, ApiFootballError
from server.src.logic.workers.helper.apply_team_roster import apply_team_roster
from server.src.logic.workers.helper.log_roster_sync_error_once import log_roster_sync_error_once
from server.src.logic.workers.helper.sports_sync_schedule import is_rate_limit_error, rate_limit_retry_delay, retry_boundary
from server.src.store.sql.sports.claim_due_team_roster_sync_jobs import claim_due_team_roster_sync_jobs
from server.src.store.sql.sports.complete_team_roster_sync_job import complete_team_roster_sync_job
from server.src.store.sql.sports.populate_match_player_pool_from_team_roster import populate_match_player_pool_from_team_roster
from server.src.store.sql.sports.release_team_roster_sync_job import release_team_roster_sync_job

async def process_due_team_roster_sync_jobs(pool: Pool, api: ApiFootballClient) -> None:
    async with pool.acquire() as conn:
        jobs = await claim_due_team_roster_sync_jobs(conn)

    for job in jobs:
        now = datetime.now(timezone.utc)
        try:
            squads = await api.squad(job.provider_team_id)
        except ApiFootballError as exc:
            async with pool.acquire() as conn:
                await release_team_roster_sync_job(conn, job.roster_sync_id, retry_boundary(now, rate_limit_retry_delay(exc, default_minutes=30)), str(exc))
            log_roster_sync_error_once(job.provider_team_id, exc)
            if is_rate_limit_error(exc):
                break
            continue

        async with pool.acquire() as conn:
            async with conn.transaction():
                await apply_team_roster(conn, job, squads)
                await populate_match_player_pool_from_team_roster(conn, job.team_id, job.competition_season_id)
                await complete_team_roster_sync_job(conn, job.roster_sync_id)
