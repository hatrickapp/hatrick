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

async def username_is_available(conn: Connection, username: str, username_hash: str, user_id: UUID) -> bool:
    query = """
    SELECT NOT EXISTS (
        SELECT 1
        FROM users
        WHERE is_deleted = FALSE
          AND user_id <> $3
          AND (username_hash = $2 OR lower(username) = $1)
    )
    AND NOT EXISTS (
        SELECT 1
        FROM username_reservations
        WHERE reserved_until > NOW()
          AND user_id <> $3
          AND (username_hash = $2 OR lower(username) = $1)
    )
    """

    return bool(await conn.fetchval(query, username, username_hash, user_id))
