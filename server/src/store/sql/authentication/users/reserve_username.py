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

async def reserve_username(conn: Connection, user_id: UUID, username: str, username_hash: str) -> None:
    query = """
    INSERT INTO username_reservations (
        username_reservation_id,
        user_id,
        username,
        username_hash,
        reserved_until
    )
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
    """

    await conn.execute(query, uuid7(), user_id, username, username_hash)
