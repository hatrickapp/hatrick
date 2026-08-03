from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def select_settleable_matches(conn: Connection) -> list[UUID]:
    rows = await conn.fetch(
        """
        SELECT m.match_id
        FROM matches m
        LEFT JOIN match_sync_state mss ON mss.match_id = m.match_id
        WHERE m.is_settled = FALSE
          AND m.status IN ('FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO')
          AND m.updated_at <= NOW() - INTERVAL '5 minutes'
          AND (
            m.status IN ('PST', 'CANC', 'ABD', 'AWD', 'WO')
            OR mss.final_synced_at IS NOT NULL
          )
        ORDER BY m.kickoff_at ASC
        LIMIT 40
        """
    )
    return [row["match_id"] for row in rows]
