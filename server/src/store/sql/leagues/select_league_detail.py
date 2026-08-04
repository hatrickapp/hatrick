from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.league_select import league_select
from src.store.sql.leagues.map_league import map_league
from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.leagues.select_league_competitions import select_league_competitions
from src.store.sql.sports.read_models import CompetitionRow

async def select_league_detail(conn: Connection, league_id: UUID, viewer_user_id: UUID) -> LeagueRow | None:
    query = league_select(viewer_user_id) + """
      AND l.league_id = $2
    GROUP BY l.league_id, hu.username, hu.name, user_standing.rank, user_standing.points
    """
    row = await conn.fetchrow(query, viewer_user_id, league_id)
    if row is None:
        return None
    league = map_league(row)
    league.competitions = await select_league_competitions(conn, league_id)
    return league
