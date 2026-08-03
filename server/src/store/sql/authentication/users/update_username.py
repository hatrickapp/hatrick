from dataclasses import dataclass
from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

@dataclass
class UsernameMutationState:
    user_id: UUID
    username: str
    username_hash: str
    username_changed_at: datetime | None
    username_setup_completed: bool

async def update_username(
    conn: Connection,
    user_id: UUID,
    username: str,
    username_hash: str,
    setup_completed: bool = True,
) -> str | None:
    query = """
    UPDATE users
    SET
        username = $2,
        username_hash = $3,
        username_changed_at = NOW(),
        username_setup_completed = $4,
        updated_at = NOW()
    WHERE user_id = $1
      AND is_deleted = FALSE
      AND $2 ~ '^[a-z0-9_]{3,20}$'
    RETURNING username
    """

    row = await conn.fetchrow(query, user_id, username, username_hash, setup_completed)
    return row["username"] if row is not None else None
