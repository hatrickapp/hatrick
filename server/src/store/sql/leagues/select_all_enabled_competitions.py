from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_all_enabled_competitions(conn: Connection) -> list[CompetitionRow]:
    rows = await conn.fetch(
        """
        SELECT competition_id, name, country, type, logo_url, sort_order
        FROM competitions
        WHERE is_enabled = TRUE
        ORDER BY sort_order, name
        """
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
