from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def upsert_player(conn: Connection, player: dict[str, Any]) -> UUID | None:
    provider_player_id = player.get("id")
    if provider_player_id is None:
        return None
    row = await conn.fetchrow(
        """
        INSERT INTO players (player_id, provider_player_id, name, photo_url, position)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (provider_player_id) DO UPDATE
        SET name = EXCLUDED.name,
            photo_url = COALESCE(EXCLUDED.photo_url, players.photo_url),
            position = COALESCE(EXCLUDED.position, players.position),
            updated_at = NOW()
        RETURNING player_id
        """,
        uuid7(),
        provider_player_id,
        player.get("name") or "Unknown",
        player.get("photo"),
        player.get("pos") or player.get("position"),
    )
    return row["player_id"]
