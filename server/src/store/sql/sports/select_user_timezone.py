from uuid import UUID

from asyncpg import Connection

async def select_user_timezone(conn: Connection, user_id: UUID) -> str:
    query = """
    SELECT timezone
    FROM users
    WHERE user_id = $1
      AND is_deleted = FALSE
    """

    row = await conn.fetchrow(query, user_id)
    return row["timezone"] if row else "UTC"
