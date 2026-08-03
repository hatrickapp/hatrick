from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from src.store.sql.sports.map_match import map_match
from src.store.sql.sports.map_match_goal import map_match_goal
from src.store.sql.sports.map_match_player import map_match_player
from src.store.sql.sports.read_models import MatchGoalRow, MatchPlayerRow, MatchRow

async def list_match_players(conn: Connection, match_id: UUID) -> list[MatchPlayerRow]:
    query = """
    SELECT
        mpp.team_id,
        p.player_id,
        p.name,
        p.photo_url,
        p.position AS position,
        mpp.shirt_number,
        mpp.source
    FROM match_player_pool mpp
    JOIN players p ON p.player_id = mpp.player_id
    WHERE mpp.match_id = $1
      AND mpp.is_available = TRUE
    ORDER BY p.name ASC
    """

    rows = await conn.fetch(query, match_id)
    return [map_match_player(row) for row in rows]
