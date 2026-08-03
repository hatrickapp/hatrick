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

async def ensure_match_sync_state(conn: Connection) -> int:
    result = await conn.execute(
        """
        INSERT INTO match_sync_state (
            match_id,
            provider_fixture_id,
            stage,
            next_sync_at,
            last_status
        )
        SELECT
            m.match_id,
            m.provider_fixture_id,
            CASE
              WHEN m.status IN ('FT', 'AET', 'PEN') THEN 'final_confirm'
              WHEN m.status IN ('PST', 'CANC', 'ABD', 'AWD', 'WO') THEN 'void'
              WHEN m.status NOT IN ('NS', 'TBD') THEN 'live'
              ELSE 'scheduled'
            END,
            CASE
              WHEN m.is_settled THEN NULL
              WHEN m.status IN ('FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO') THEN NOW()
              WHEN m.status NOT IN ('NS', 'TBD') THEN NOW()
              WHEN m.kickoff_at <= NOW() THEN NOW()
              WHEN m.kickoff_at - NOW() > INTERVAL '24 hours' THEN m.kickoff_at - INTERVAL '24 hours'
              WHEN m.kickoff_at - NOW() > INTERVAL '6 hours' THEN m.kickoff_at - INTERVAL '6 hours'
              WHEN m.kickoff_at - NOW() > INTERVAL '90 minutes' THEN m.kickoff_at - INTERVAL '90 minutes'
              WHEN m.kickoff_at - NOW() > INTERVAL '35 minutes' THEN m.kickoff_at - INTERVAL '35 minutes'
              WHEN m.kickoff_at - NOW() > INTERVAL '20 minutes' THEN m.kickoff_at - INTERVAL '20 minutes'
              WHEN m.kickoff_at - NOW() > INTERVAL '5 minutes' THEN m.kickoff_at - INTERVAL '5 minutes'
              WHEN m.kickoff_at > NOW() THEN m.kickoff_at
              ELSE NOW() + INTERVAL '60 minutes'
            END,
            m.status
        FROM matches m
        WHERE m.is_settled = FALSE
          AND m.kickoff_at >= date_trunc('day', NOW())
          AND m.kickoff_at < date_trunc('day', NOW()) + INTERVAL '1 day'
        ON CONFLICT (match_id) DO UPDATE
        SET provider_fixture_id = EXCLUDED.provider_fixture_id,
            stage = CASE
              WHEN match_sync_state.stage IN ('settled', 'void', 'stopped') THEN match_sync_state.stage
              WHEN EXCLUDED.stage IN ('live', 'final_confirm', 'void') THEN EXCLUDED.stage
              ELSE match_sync_state.stage
            END,
            last_status = EXCLUDED.last_status,
            updated_at = NOW(),
            next_sync_at = CASE
              WHEN match_sync_state.stage IN ('settled', 'void', 'stopped') THEN NULL
              WHEN match_sync_state.final_synced_at IS NOT NULL AND EXCLUDED.stage = 'final_confirm' THEN NULL
              WHEN match_sync_state.last_status IS DISTINCT FROM EXCLUDED.last_status
                AND EXCLUDED.stage IN ('live', 'final_confirm', 'void') THEN EXCLUDED.next_sync_at
              WHEN match_sync_state.next_sync_at IS NULL THEN EXCLUDED.next_sync_at
              ELSE LEAST(match_sync_state.next_sync_at, EXCLUDED.next_sync_at)
            END,
            sync_stopped = CASE WHEN match_sync_state.stage IN ('settled', 'void', 'stopped') THEN match_sync_state.sync_stopped ELSE FALSE END
        """
    )
    return int(result.split()[-1])
