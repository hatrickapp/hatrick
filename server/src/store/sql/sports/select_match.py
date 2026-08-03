from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from server.src.store.sql.sports.map_match import map_match
from server.src.store.sql.sports.map_match_goal import map_match_goal
from server.src.store.sql.sports.map_match_player import map_match_player
from server.src.store.sql.sports.match_select import MATCH_SELECT
from server.src.store.sql.sports.read_models import MatchGoalRow, MatchPlayerRow, MatchRow

async def select_match(conn: Connection, user_id: UUID, match_id: UUID) -> MatchRow | None:
    query = MATCH_SELECT + """
WHERE m.match_id = $2
"""

    row = await conn.fetchrow(query, user_id, match_id)
    return map_match(row) if row else None
