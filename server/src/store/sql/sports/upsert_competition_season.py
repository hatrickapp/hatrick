from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

async def upsert_competition_season(conn: Connection, competition_id: UUID, season_year: int) -> UUID:
    row = await conn.fetchrow(
        """
        INSERT INTO competition_seasons (
            competition_season_id,
            competition_id,
            season_year,
            provider_season,
            is_current
        )
        VALUES ($1, $2, $3, $3, TRUE)
        ON CONFLICT (competition_id, season_year) DO UPDATE
        SET is_current = TRUE,
            updated_at = NOW()
        RETURNING competition_season_id
        """,
        uuid7(),
        competition_id,
        season_year,
    )
    return row["competition_season_id"]
