from dataclasses import dataclass
from uuid import UUID

from asyncpg import Connection

@dataclass
class ProfileMutationState:
    user_id: UUID
    name: str | None
    provider: str


async def select_profile_mutation_state(conn: Connection, user_id: UUID) -> ProfileMutationState | None:
    query = """
    SELECT
        user_id,
        name,
        provider
    FROM users
    WHERE user_id = $1
      AND is_deleted = FALSE
    """

    row = await conn.fetchrow(query, user_id)
    if row is None:
        return None

    return ProfileMutationState(
        user_id=row["user_id"],
        name=row["name"],
        provider=row["provider"],
    )
