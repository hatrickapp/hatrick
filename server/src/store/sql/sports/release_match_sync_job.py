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

async def release_match_sync_job(conn: Connection, match_id: UUID, next_sync_at: datetime, error: str) -> None:
    await conn.execute(
        """
        UPDATE match_sync_state
        SET syncing_at = NULL,
            next_sync_at = $2,
            last_error = $3,
            updated_at = NOW()
        WHERE match_id = $1
        """,
        match_id,
        next_sync_at,
        error,
    )
