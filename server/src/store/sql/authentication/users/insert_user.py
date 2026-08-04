from dataclasses import dataclass
from secrets import token_hex
from typing import Literal
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.app.crypto.encryption.aes_encrypt import encrypt
from src.app.crypto.encryption.hash_blake2s import hash_blake2s

Provider = Literal["google", "apple"]

@dataclass
class InsertedUser:
    user_id: UUID

async def insert_user(
    conn: Connection,
    email: str,
    provider: Provider,
    username: str | None,
    username_hash: str | None,
    name: str | None = None,
    oauth_subject: str | None = None,
) -> InsertedUser:
    email_encrypted = encrypt(email)
    email_hash = hash_blake2s(email)
    user_id = uuid7()
    username = username or f"hatrick_{token_hex(4)}"
    username_hash = username_hash or hash_blake2s(username)

    query = """
    INSERT INTO users (
        user_id,
        email_encrypted,
        email_hash,
        provider,
        name,
        oauth_subject,
        username,
        username_hash,
        username_setup_completed
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
    RETURNING user_id
    """

    row = await conn.fetchrow(
        query,
        user_id,
        email_encrypted,
        email_hash,
        provider,
        name,
        oauth_subject,
        username,
        username_hash,
    )

    return InsertedUser(user_id=row["user_id"])
