from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def get_enabled_competitions(conn: Connection) -> list[dict[str, Any]]:
    rows = await conn.fetch(
        """
        SELECT competition_id, provider_league_id, current_season
        FROM competitions
        WHERE is_enabled = TRUE
        ORDER BY sort_order ASC
        """
    )
    return [dict(row) for row in rows]
