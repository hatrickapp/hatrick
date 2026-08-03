from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from server.src.store.sql.sports.map_match import map_match
from server.src.store.sql.sports.map_match_goal import map_match_goal
from server.src.store.sql.sports.map_match_player import map_match_player
from server.src.store.sql.sports.read_models import MatchGoalRow, MatchPlayerRow, MatchRow

async def list_match_goals(conn: Connection, match_id: UUID) -> list[MatchGoalRow]:
    query = """
    SELECT
        mg.match_goal_id,
        mg.match_id,
        mg.team_id,
        mg.player_id,
        mg.scorer_name,
        COALESCE(mpp.shirt_number, tp.shirt_number) AS shirt_number,
        mg.event_minute,
        mg.event_extra,
        mg.goal_type
    FROM match_goals mg
    JOIN matches m ON m.match_id = mg.match_id
    LEFT JOIN match_player_pool mpp
      ON mpp.match_id = mg.match_id
     AND mpp.player_id = mg.player_id
    LEFT JOIN team_players tp
      ON tp.team_id = mg.team_id
     AND tp.player_id = mg.player_id
     AND tp.competition_season_id = m.competition_season_id
    WHERE mg.match_id = $1
    ORDER BY mg.event_minute ASC NULLS LAST, mg.event_extra ASC NULLS LAST, mg.created_at ASC
    """

    rows = await conn.fetch(query, match_id)
    return [map_match_goal(row) for row in rows]
