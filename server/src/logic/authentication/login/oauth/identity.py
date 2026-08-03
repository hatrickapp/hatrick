from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from asyncpg import Connection

from src.app.crypto.encryption.aes_decrypt import decrypt
from src.app.crypto.encryption.hash_blake2s import hash_blake2s
from src.store.sql.authentication.users.select_user_by_email_hash import select_user_by_email_hash

@dataclass
class OAuthIdentity:
    user_id: UUID
    email: str
    account_status: str
    role: str

Provider = Literal["google", "apple"]

async def lookup_oauth_identity(
    conn: Connection,
    provider: Provider,
    subject: str | None,
    email: str | None,
) -> OAuthIdentity | None:
    if subject:
        row = await conn.fetchrow(
            """
            SELECT user_id, email_encrypted, account_status, role
            FROM users
            WHERE provider = $1
              AND oauth_subject = $2
              AND is_deleted = FALSE
            LIMIT 1
            """,
            provider,
            subject,
        )
        if row is not None:
            plaintext_email = decrypt(row["email_encrypted"])
            return OAuthIdentity(
                user_id=row["user_id"],
                email=plaintext_email,
                account_status=row["account_status"],
                role=row["role"],
            )

    if email is None:
        return None

    email_hash = hash_blake2s(email)

    row = await select_user_by_email_hash(conn, email_hash)
    if row is None:
        return None

    plaintext_email = decrypt(row.email_encrypted)
    return OAuthIdentity(
        user_id=row.user_id,
        email=plaintext_email,
        account_status=row.account_status,
        role=row.role,
    )
