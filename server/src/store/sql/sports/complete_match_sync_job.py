from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from asyncpg import Connection

@dataclass
class MatchSyncJob:
    match_id: UUID
    provider_fixture_id: int
    kickoff_at: datetime
    status: str
    stage: str
    last_events_sync_at: datetime | None
    final_synced_at: datetime | None
@dataclass
class TeamRosterSyncJob:
    roster_sync_id: UUID
    team_id: UUID
    competition_season_id: UUID
    provider_team_id: int
    next_match_kickoff_at: datetime
    latest_match_kickoff_at: datetime

async def complete_match_sync_job(
    conn: Connection,
    match_id: UUID,
    stage: str,
    next_sync_at: datetime | None,
    status: str,
    *,
    fixture_synced: bool = False,
    events_synced: bool = False,
    final_synced: bool = False,
    stop: bool = False,
    error: str | None = None,
) -> None:
    await conn.execute(
        """
        UPDATE match_sync_state
        SET stage = $2,
            next_sync_at = $3,
            syncing_at = NULL,
            last_status = $4,
            last_fixture_sync_at = CASE WHEN $5 THEN NOW() ELSE last_fixture_sync_at END,
            last_events_sync_at = CASE WHEN $6 THEN NOW() ELSE last_events_sync_at END,
            final_synced_at = CASE WHEN $7 THEN NOW() ELSE final_synced_at END,
            sync_stopped = $8,
            last_error = $9,
            updated_at = NOW()
        WHERE match_id = $1
        """,
        match_id,
        stage,
        next_sync_at,
        status,
        fixture_synced,
        events_synced,
        final_synced,
        stop,
        error,
    )
