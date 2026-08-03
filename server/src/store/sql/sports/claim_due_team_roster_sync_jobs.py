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

async def claim_due_team_roster_sync_jobs(conn: Connection) -> list[TeamRosterSyncJob]:
    rows = await conn.fetch(
        """
        WITH due AS (
            SELECT roster_sync_id
            FROM team_roster_sync_state
            WHERE roster_status != 'stopped'
              AND next_roster_sync_at IS NOT NULL
              AND next_roster_sync_at <= NOW()
              AND (syncing_at IS NULL OR syncing_at <= NOW() - INTERVAL '10 minutes')
            ORDER BY next_roster_sync_at ASC, next_match_kickoff_at ASC
            FOR UPDATE SKIP LOCKED
        )
        UPDATE team_roster_sync_state trs
        SET syncing_at = NOW(),
            updated_at = NOW()
        FROM due
        WHERE trs.roster_sync_id = due.roster_sync_id
        RETURNING
            trs.roster_sync_id,
            trs.team_id,
            trs.competition_season_id,
            trs.provider_team_id,
            trs.next_match_kickoff_at,
            trs.latest_match_kickoff_at
        """
    )
    return [
        TeamRosterSyncJob(
            roster_sync_id=row["roster_sync_id"],
            team_id=row["team_id"],
            competition_season_id=row["competition_season_id"],
            provider_team_id=row["provider_team_id"],
            next_match_kickoff_at=row["next_match_kickoff_at"],
            latest_match_kickoff_at=row["latest_match_kickoff_at"],
        )
        for row in rows
    ]
