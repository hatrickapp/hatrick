from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

async def lock_due_matches(conn: Connection) -> int:
    result = await conn.execute(
        """
        UPDATE matches
        SET is_locked = TRUE,
            locked_at = COALESCE(locked_at, NOW()),
            updated_at = NOW()
        WHERE is_locked = FALSE
          AND NOW() >= kickoff_at - INTERVAL '5 minutes'
        """
    )
    return int(result.split()[-1])
