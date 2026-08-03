from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

async def upsert_team_player(
    conn: Connection,
    team_id: UUID,
    player_id: UUID,
    competition_season_id: UUID | None,
    player: dict[str, Any],
    source: str,
) -> None:
    if competition_season_id is None:
        return
    await conn.execute(
        """
        INSERT INTO team_players (
            team_player_id,
            team_id,
            player_id,
            competition_season_id,
            shirt_number,
            position,
            source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (team_id, player_id, competition_season_id) DO UPDATE
        SET shirt_number = COALESCE(EXCLUDED.shirt_number, team_players.shirt_number),
            position = COALESCE(EXCLUDED.position, team_players.position),
            source = EXCLUDED.source,
            is_active = TRUE,
            updated_at = NOW()
        """,
        uuid7(),
        team_id,
        player_id,
        competition_season_id,
        player.get("number"),
        player.get("pos") or player.get("position"),
        source,
    )
