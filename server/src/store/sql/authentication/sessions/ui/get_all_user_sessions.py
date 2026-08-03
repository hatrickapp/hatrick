from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from asyncpg import Connection

@dataclass
class UserSession:
    session_id: UUID
    country: str
    created_at: datetime
    expires_at: datetime

async def get_all_user_sessions(conn: Connection, user_id: UUID) -> list[UserSession]:
    query = """
    SELECT 
        session_id, 
        country, 
        created_at, 
        expires_at
    FROM sessions
    WHERE user_id = $1
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 6
    """
    
    rows = await conn.fetch(query, user_id)
    
    return [
        UserSession(
            session_id=row["session_id"],
            country=row["country"],
            created_at=row["created_at"],
            expires_at=row["expires_at"]
        )
        for row in rows
    ]
