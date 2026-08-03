from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def users_for_match_predictions(conn: Connection, match_id: UUID) -> list[dict[str, Any]]:
    rows = await conn.fetch(
        """
        SELECT DISTINCT u.user_id, u.timezone
        FROM predictions p
        JOIN users u ON u.user_id = p.user_id
        WHERE p.match_id = $1
        """,
        match_id,
    )
    return [dict(row) for row in rows]
