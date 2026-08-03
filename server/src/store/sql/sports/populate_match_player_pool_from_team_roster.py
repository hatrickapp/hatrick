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

async def populate_match_player_pool_from_team_roster(conn: Connection, team_id: UUID, competition_season_id: UUID) -> int:
    result = await conn.execute(
        """
        INSERT INTO match_player_pool (
            match_player_pool_id,
            match_id,
            team_id,
            player_id,
            source,
            shirt_number
        )
        SELECT
            gen_random_uuid(),
            m.match_id,
            tp.team_id,
            tp.player_id,
            'squad',
            tp.shirt_number
        FROM matches m
        JOIN team_players tp
          ON tp.team_id = $1
         AND tp.competition_season_id = $2
         AND tp.is_active = TRUE
        WHERE m.competition_season_id = $2
          AND (m.home_team_id = $1 OR m.away_team_id = $1)
          AND m.kickoff_at >= NOW() - INTERVAL '12 hours'
        ON CONFLICT (match_id, player_id) DO UPDATE
        SET team_id = EXCLUDED.team_id,
            shirt_number = COALESCE(EXCLUDED.shirt_number, match_player_pool.shirt_number),
            is_available = TRUE,
            updated_at = NOW()
        """
        ,
        team_id,
        competition_season_id,
    )
    return int(result.split()[-1])
