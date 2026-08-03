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

async def ensure_team_roster_sync_state(conn: Connection) -> int:
    result = await conn.execute(
        """
        WITH team_matches AS (
            SELECT
                m.home_team_id AS team_id,
                ht.provider_team_id,
                m.competition_season_id,
                MIN(m.kickoff_at) AS next_match_kickoff_at,
                MAX(m.kickoff_at) AS latest_match_kickoff_at
            FROM matches m
            JOIN teams ht ON ht.team_id = m.home_team_id
            WHERE m.competition_season_id IS NOT NULL
              AND m.is_settled = FALSE
              AND m.kickoff_at >= NOW() - INTERVAL '6 hours'
              AND m.kickoff_at < date_trunc('day', NOW()) + INTERVAL '1 day'
            GROUP BY m.home_team_id, ht.provider_team_id, m.competition_season_id

            UNION ALL

            SELECT
                m.away_team_id AS team_id,
                at.provider_team_id,
                m.competition_season_id,
                MIN(m.kickoff_at) AS next_match_kickoff_at,
                MAX(m.kickoff_at) AS latest_match_kickoff_at
            FROM matches m
            JOIN teams at ON at.team_id = m.away_team_id
            WHERE m.competition_season_id IS NOT NULL
              AND m.is_settled = FALSE
              AND m.kickoff_at >= NOW() - INTERVAL '6 hours'
              AND m.kickoff_at < date_trunc('day', NOW()) + INTERVAL '1 day'
            GROUP BY m.away_team_id, at.provider_team_id, m.competition_season_id
        ),
        compact AS (
            SELECT
                team_id,
                provider_team_id,
                competition_season_id,
                MIN(next_match_kickoff_at) AS next_match_kickoff_at,
                MAX(latest_match_kickoff_at) AS latest_match_kickoff_at
            FROM team_matches
            GROUP BY team_id, provider_team_id, competition_season_id
        )
        INSERT INTO team_roster_sync_state (
            roster_sync_id,
            team_id,
            provider_team_id,
            competition_season_id,
            next_match_kickoff_at,
            latest_match_kickoff_at,
            next_roster_sync_at
        )
        SELECT
            gen_random_uuid(),
            team_id,
            provider_team_id,
            competition_season_id,
            next_match_kickoff_at,
            latest_match_kickoff_at,
            CASE
              WHEN next_match_kickoff_at - NOW() > INTERVAL '48 hours' THEN next_match_kickoff_at - INTERVAL '48 hours'
              ELSE NOW()
            END
        FROM compact
        ON CONFLICT (team_id, competition_season_id) DO UPDATE
        SET provider_team_id = EXCLUDED.provider_team_id,
            next_match_kickoff_at = EXCLUDED.next_match_kickoff_at,
            latest_match_kickoff_at = GREATEST(team_roster_sync_state.latest_match_kickoff_at, EXCLUDED.latest_match_kickoff_at),
            next_roster_sync_at = CASE
              WHEN team_roster_sync_state.last_roster_sync_at IS NULL THEN LEAST(
                COALESCE(team_roster_sync_state.next_roster_sync_at, EXCLUDED.next_roster_sync_at),
                EXCLUDED.next_roster_sync_at
              )
              WHEN team_roster_sync_state.last_roster_sync_at <= NOW() - INTERVAL '14 days' THEN LEAST(
                COALESCE(team_roster_sync_state.next_roster_sync_at, EXCLUDED.next_roster_sync_at),
                EXCLUDED.next_roster_sync_at
              )
              ELSE team_roster_sync_state.last_roster_sync_at + INTERVAL '14 days'
            END,
            roster_status = CASE
              WHEN team_roster_sync_state.last_roster_sync_at IS NULL
                OR team_roster_sync_state.last_roster_sync_at <= NOW() - INTERVAL '14 days'
              THEN 'pending'
              ELSE team_roster_sync_state.roster_status
            END,
            updated_at = NOW()
        """
    )
    return int(result.split()[-1])
