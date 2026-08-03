from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

@dataclass
class UsernameMutationState:
    user_id: UUID
    plan: str
    can_change_username: bool
    username: str
    username_hash: str
    username_changed_at: datetime | None
    username_setup_completed: bool

async def select_username_mutation_state(conn: Connection, user_id: UUID) -> UsernameMutationState | None:
    query = """
    SELECT
        u.user_id,
        u.plan,
        COALESCE(apl.can_change_username, FALSE) AS can_change_username,
        u.username,
        u.username_hash,
        u.username_changed_at,
        u.username_setup_completed
    FROM users u
    LEFT JOIN app_plan_limits apl ON apl.plan = u.plan
    WHERE u.user_id = $1
      AND u.is_deleted = FALSE
    """

    row = await conn.fetchrow(query, user_id)
    if row is None:
        return None

    return UsernameMutationState(
        user_id=row["user_id"],
        plan=row["plan"],
        can_change_username=row["can_change_username"],
        username=row["username"],
        username_hash=row["username_hash"],
        username_changed_at=row["username_changed_at"],
        username_setup_completed=row["username_setup_completed"],
    )
