from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.league_select import league_select
from src.store.sql.leagues.map_league import map_league
from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def list_user_leagues(conn: Connection, viewer_user_id: UUID) -> tuple[list[LeagueRow], list[LeagueRow]]:
    query = league_select(viewer_user_id) + """
    GROUP BY l.league_id, hu.username, hu.show_name_publicly, hu.name, user_standing.rank, user_standing.points
    ORDER BY
        CASE WHEN l.status = 'finished' THEN 1 ELSE 0 END,
        l.ends_at ASC,
        l.created_at DESC
    """
    rows = await conn.fetch(query, viewer_user_id)
    active: list[LeagueRow] = []
    history: list[LeagueRow] = []
    for row in rows:
        league = map_league(row)
        if league.status == "finished":
            history.append(league)
        else:
            active.append(league)
    return active, history
