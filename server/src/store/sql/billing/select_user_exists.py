from datetime import datetime
import json
from uuid import UUID, uuid7

from asyncpg import Connection

async def select_user_exists(conn: Connection, user_id: UUID) -> bool:
    query = """
    SELECT EXISTS (
      SELECT 1
      FROM users
      WHERE user_id = $1
        AND is_deleted = FALSE
    )
    """
    return bool(await conn.fetchval(query, user_id))
