from uuid import UUID

from asyncpg import Connection

async def update_user_timezone(conn: Connection, user_id: UUID, timezone: str) -> str:
    query = """
    UPDATE users
    SET timezone = $2,
        updated_at = NOW()
    WHERE user_id = $1
      AND is_deleted = FALSE
    RETURNING timezone
    """

    row = await conn.fetchrow(query, user_id, timezone)
    return row["timezone"] if row else timezone
