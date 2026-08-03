from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

async def record_sync_start(conn: Connection, sync_type: str) -> UUID:
    sync_run_id = uuid7()
    await conn.execute(
        """
        INSERT INTO sports_sync_runs (sync_run_id, sync_type, status)
        VALUES ($1, $2, 'running')
        """,
        sync_run_id,
        sync_type,
    )
    return sync_run_id
