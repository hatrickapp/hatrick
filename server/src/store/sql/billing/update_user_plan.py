from datetime import datetime
import json
from uuid import UUID, uuid7

from asyncpg import Connection

async def update_user_plan(conn: Connection, user_id: UUID, plan: str) -> None:
    query = """
    UPDATE users
    SET plan = $2,
        updated_at = NOW()
    WHERE user_id = $1
      AND is_deleted = FALSE
      AND plan != $2
    """
    await conn.execute(query, user_id, plan)
