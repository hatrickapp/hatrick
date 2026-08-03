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

async def stop_settled_match_sync(conn: Connection) -> int:
    result = await conn.execute(
        """
        UPDATE match_sync_state mss
        SET stage = CASE WHEN m.is_void THEN 'void' ELSE 'settled' END,
            next_sync_at = NULL,
            syncing_at = NULL,
            sync_stopped = TRUE,
            updated_at = NOW()
        FROM matches m
        WHERE m.match_id = mss.match_id
          AND m.is_settled = TRUE
          AND mss.sync_stopped = FALSE
        """
    )
    return int(result.split()[-1])
