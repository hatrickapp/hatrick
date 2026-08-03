from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from src.app.crypto.tokens.session_tokens import generate_session_token
from src.store.sql.authentication.sessions.insert_session import insert_session

@dataclass
class IssuedSession:
    session_token: str
    session_id: UUID
    expires_at: datetime
    killed_session_token_hash: str | None

async def issue_session(
    conn: Connection,
    user_id: UUID,
    country: str,
) -> IssuedSession:
    token = generate_session_token()
    result = await insert_session(conn, user_id, token, country)
    return IssuedSession(
        session_token=token,
        session_id=result.session_id,
        expires_at=result.expires_at,
        killed_session_token_hash=result.killed_session_token_hash,
    )
