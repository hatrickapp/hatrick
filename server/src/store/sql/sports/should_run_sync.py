from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

async def should_run_sync(conn: Connection, sync_type: str, min_seconds: int) -> bool:
    row = await conn.fetchrow(
        """
        SELECT started_at
        FROM sports_sync_runs
        WHERE sync_type = $1
          AND status = 'success'
        ORDER BY started_at DESC
        LIMIT 1
        """,
        sync_type,
    )
    if row is None:
        return True
    return (datetime.now(timezone.utc) - row["started_at"]).total_seconds() >= min_seconds
