from uuid import UUID

from asyncpg import Connection

async def update_name(conn: Connection, user_id: UUID, name: str) -> str | None:
    query = """
    UPDATE users
    SET
        name = $2,
        updated_at = NOW()
    WHERE user_id = $1
      AND is_deleted = FALSE
      AND provider IN ('google', 'apple')
      AND char_length($2) BETWEEN 5 AND 128
      AND $2 ~ '^[A-Za-z]([.''-]?[A-Za-z])+( [A-Za-z]([.''-]?[A-Za-z])+)+$'
    RETURNING name
    """

    row = await conn.fetchrow(query, user_id, name)
    return row["name"] if row is not None else None
