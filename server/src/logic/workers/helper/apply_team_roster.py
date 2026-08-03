from typing import Any

from src.store.sql.sports.claim_due_team_roster_sync_jobs import TeamRosterSyncJob
from src.store.sql.sports.upsert_player import upsert_player
from src.store.sql.sports.upsert_team_player import upsert_team_player

async def apply_team_roster(conn, job: TeamRosterSyncJob, squads: list[dict[str, Any]]) -> None:
    for squad in squads:
        for player in squad.get("players") or []:
            player_id = await upsert_player(conn, player)
            if player_id is None:
                continue
            await upsert_team_player(conn, job.team_id, player_id, job.competition_season_id, player, "squad")
