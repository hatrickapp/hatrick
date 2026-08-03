from datetime import datetime, timedelta

from src.logic.sports.api_football_client import ApiFootballError
from src.logic.workers.helper.sports_sync_constants import FINISHED_STATUSES, SCHEDULED_STATUSES, VOID_STATUSES
from src.store.sql.sports.claim_due_match_sync_jobs import MatchSyncJob

def should_sync_events(job: MatchSyncJob, status: str, now: datetime) -> bool:
    if status in FINISHED_STATUSES:
        return job.final_synced_at is None
    if job.last_events_sync_at is None:
        return True
    return now - job.last_events_sync_at >= timedelta(minutes=5)


def should_use_live_fixture_batch(job: MatchSyncJob, now: datetime) -> bool:
    if job.status in FINISHED_STATUSES or job.status in VOID_STATUSES:
        return False
    seconds_from_kickoff = (now - job.kickoff_at).total_seconds()
    return -5 * 60 <= seconds_from_kickoff <= 3 * 60 * 60


def should_skip_single_fixture_lookup_after_live_batch(job: MatchSyncJob, now: datetime) -> bool:
    if not should_use_live_fixture_batch(job, now):
        return False
    if job.status not in SCHEDULED_STATUSES:
        return False
    seconds_from_kickoff = (now - job.kickoff_at).total_seconds()
    return -5 * 60 <= seconds_from_kickoff <= 2 * 60 * 60


def unmatched_live_batch_schedule(now: datetime) -> tuple[str, datetime]:
    return "delayed", next_five_minute_boundary(now)


def next_match_schedule(job: MatchSyncJob, status: str, now: datetime, events_synced: bool) -> tuple[str, datetime | None, bool]:
    if status in VOID_STATUSES:
        return "void", None, True
    if status in FINISHED_STATUSES:
        if events_synced:
            return "final_confirm", None, True
        return "final_confirm", next_minute_boundary(now), False
    if status not in SCHEDULED_STATUSES:
        return "live", next_five_minute_boundary(now), False

    seconds_to_kickoff = (job.kickoff_at - now).total_seconds()
    if seconds_to_kickoff > 24 * 60 * 60:
        return "scheduled", job.kickoff_at - timedelta(hours=24), False
    if seconds_to_kickoff > 6 * 60 * 60:
        return "scheduled", job.kickoff_at - timedelta(hours=6), False
    if seconds_to_kickoff > 90 * 60:
        return "scheduled", job.kickoff_at - timedelta(minutes=90), False
    if seconds_to_kickoff > 35 * 60:
        return "pre_kickoff", job.kickoff_at - timedelta(minutes=35), False
    if seconds_to_kickoff > 20 * 60:
        return "pre_kickoff", job.kickoff_at - timedelta(minutes=20), False
    if seconds_to_kickoff > 5 * 60:
        return "pre_kickoff", job.kickoff_at - timedelta(minutes=5), False
    if seconds_to_kickoff >= -10 * 60:
        return "delayed", next_five_minute_boundary(now), False
    if seconds_to_kickoff >= -60 * 60:
        return "delayed", next_five_minute_boundary(now, step_minutes=10), False
    return "delayed", next_five_minute_boundary(now, step_minutes=60), False


def next_minute_boundary(now: datetime) -> datetime:
    base = now.replace(second=0, microsecond=0)
    if now == base:
        return base + timedelta(minutes=1)
    return base + timedelta(minutes=1)


def next_five_minute_boundary(now: datetime, *, step_minutes: int = 5) -> datetime:
    base = now.replace(second=0, microsecond=0)
    minute_offset = step_minutes - (base.minute % step_minutes)
    if minute_offset == 0:
        minute_offset = step_minutes
    return base + timedelta(minutes=minute_offset)


def is_rate_limit_error(exc: ApiFootballError) -> bool:
    message = str(exc)
    return "rateLimit" in message or "Too many requests" in message


def rate_limit_retry_delay(exc: ApiFootballError, *, default_minutes: int = 10) -> timedelta:
    if is_rate_limit_error(exc):
        return timedelta(minutes=1)
    return timedelta(minutes=default_minutes)


def retry_boundary(now: datetime, delay: timedelta) -> datetime:
    target = now + delay
    base = target.replace(second=0, microsecond=0)
    if target == base:
        return base
    return base + timedelta(minutes=1)
