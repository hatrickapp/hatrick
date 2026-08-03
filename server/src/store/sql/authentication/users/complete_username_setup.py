from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

@dataclass
class UsernameMutationState:
    user_id: UUID
    username: str
    username_hash: str
    username_changed_at: datetime | None
    username_setup_completed: bool

async def complete_username_setup(conn: Connection, user_id: UUID) -> str | None:
    query = """
    UPDATE users
    SET
        username_setup_completed = TRUE,
        updated_at = NOW()
    WHERE user_id = $1
      AND is_deleted = FALSE
    RETURNING username
    """

    row = await conn.fetchrow(query, user_id)
    return row["username"] if row is not None else None
