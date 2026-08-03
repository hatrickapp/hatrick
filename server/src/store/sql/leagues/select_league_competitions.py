from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.sports.read_models import CompetitionRow

async def select_league_competitions(conn: Connection, league_id: UUID) -> list[CompetitionRow]:
    rows = await conn.fetch(
        """
        SELECT c.competition_id, c.name, c.country, c.type, c.logo_url, c.sort_order
        FROM league_competitions lc
        JOIN competitions c ON c.competition_id = lc.competition_id
        WHERE lc.league_id = $1
        ORDER BY c.sort_order, c.name
        """,
        league_id,
    )
    return [
        CompetitionRow(
            competition_id=row["competition_id"],
            name=row["name"],
            country=row["country"],
            type=row["type"],
            logo_url=row["logo_url"],
            sort_order=row["sort_order"],
        )
        for row in rows
    ]
