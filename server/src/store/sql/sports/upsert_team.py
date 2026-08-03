from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

async def upsert_team(conn: Connection, team: dict[str, Any]) -> UUID | None:
    provider_team_id = team.get("id")
    if provider_team_id is None:
        return None
    row = await conn.fetchrow(
        """
        INSERT INTO teams (team_id, provider_team_id, name, short_name, logo_url)
        VALUES ($1, $2, $3, $3, $4)
        ON CONFLICT (provider_team_id) DO UPDATE
        SET name = EXCLUDED.name,
            short_name = EXCLUDED.short_name,
            logo_url = EXCLUDED.logo_url,
            updated_at = NOW()
        RETURNING team_id
        """,
        uuid7(),
        provider_team_id,
        team.get("name") or "Unknown",
        team.get("logo"),
    )
    return row["team_id"]
