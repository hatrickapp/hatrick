from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

async def record_sync_finish(conn: Connection, sync_run_id: UUID, status: str, details: str = "{}") -> None:
    await conn.execute(
        """
        UPDATE sports_sync_runs
        SET status = $2,
            completed_at = NOW(),
            details = $3::jsonb
        WHERE sync_run_id = $1
        """,
        sync_run_id,
        status,
        details,
    )
