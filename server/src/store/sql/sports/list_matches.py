from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from src.store.sql.sports.map_match import map_match
from src.store.sql.sports.map_match_goal import map_match_goal
from src.store.sql.sports.map_match_player import map_match_player
from src.store.sql.sports.match_select import MATCH_SELECT
from src.store.sql.sports.read_models import MatchGoalRow, MatchPlayerRow, MatchRow

async def list_matches(
    conn: Connection,
    user_id: UUID,
    start_at: datetime,
    end_at: datetime,
    competition_id: UUID | None,
) -> list[MatchRow]:
    query = MATCH_SELECT + """
WHERE m.kickoff_at >= $2
  AND m.kickoff_at < $3
  AND ($4::uuid IS NULL OR m.competition_id = $4)
ORDER BY m.kickoff_at ASC, c.sort_order ASC, ht.name ASC
"""

    rows = await conn.fetch(query, user_id, start_at, end_at, competition_id)
    return [map_match(row) for row in rows]
