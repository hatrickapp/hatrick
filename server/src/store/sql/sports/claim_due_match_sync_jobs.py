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

async def claim_due_match_sync_jobs(conn: Connection) -> list[MatchSyncJob]:
    rows = await conn.fetch(
        """
        WITH due AS (
            SELECT mss.match_id
            FROM match_sync_state mss
            JOIN matches m ON m.match_id = mss.match_id
            WHERE mss.sync_stopped = FALSE
              AND mss.next_sync_at IS NOT NULL
              AND mss.next_sync_at <= NOW()
              AND (mss.syncing_at IS NULL OR mss.syncing_at <= NOW() - INTERVAL '10 minutes')
              AND m.is_settled = FALSE
              AND m.kickoff_at >= date_trunc('day', NOW())
              AND m.kickoff_at < date_trunc('day', NOW()) + INTERVAL '1 day'
            ORDER BY
              CASE
                WHEN m.status NOT IN ('NS', 'TBD', 'FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO') THEN 1
                WHEN m.status IN ('FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO') THEN 2
                WHEN m.kickoff_at <= NOW() + INTERVAL '35 minutes' THEN 3
                ELSE 4
              END,
              mss.next_sync_at ASC,
              m.kickoff_at ASC
            FOR UPDATE SKIP LOCKED
        )
        UPDATE match_sync_state mss
        SET syncing_at = NOW(),
            updated_at = NOW()
        FROM due
        JOIN matches m ON m.match_id = due.match_id
        WHERE mss.match_id = due.match_id
        RETURNING
            mss.match_id,
            mss.provider_fixture_id,
            m.kickoff_at,
            m.status,
            mss.stage,
            mss.last_events_sync_at,
            mss.final_synced_at
        """
    )
    return [
        MatchSyncJob(
            match_id=row["match_id"],
            provider_fixture_id=row["provider_fixture_id"],
            kickoff_at=row["kickoff_at"],
            status=row["status"],
            stage=row["stage"],
            last_events_sync_at=row["last_events_sync_at"],
            final_synced_at=row["final_synced_at"],
        )
        for row in rows
    ]
