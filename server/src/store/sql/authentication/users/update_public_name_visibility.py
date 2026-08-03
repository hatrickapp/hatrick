from uuid import UUID

from asyncpg import Connection

async def update_public_name_visibility(conn: Connection, user_id: UUID, show_name_publicly: bool) -> bool | None:
    query = """
    UPDATE users
    SET show_name_publicly = $2,
        updated_at = NOW()
    WHERE user_id = $1
      AND is_deleted = FALSE
    RETURNING show_name_publicly
    """
    row = await conn.fetchrow(query, user_id, show_name_publicly)
    if row is None:
        return None
    return row["show_name_publicly"]
