from dataclasses import dataclass
from uuid import UUID

from asyncpg import Connection

@dataclass
class UserByEmailHash:
    user_id: UUID
    is_deleted: bool
    email_encrypted: str
    account_status: str
    role: str

async def select_user_by_email_hash(conn: Connection, email_hash: str) -> UserByEmailHash | None:
    query = """
    SELECT user_id, is_deleted, email_encrypted, account_status, role
    FROM users
    WHERE email_hash = $1 AND is_deleted = FALSE
    """

    row = await conn.fetchrow(query, email_hash)

    if row is None:
        return None

    return UserByEmailHash(
        user_id=row["user_id"],
        is_deleted=row["is_deleted"],
        email_encrypted=row["email_encrypted"],
        account_status=row["account_status"],
        role=row["role"],
    )
