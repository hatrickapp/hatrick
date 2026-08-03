from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.sports.read_models import CompetitionRow

async def insert_league_competitions(conn: Connection, league_id: UUID, competition_ids: list[UUID]) -> None:
    await conn.executemany(
        """
        INSERT INTO league_competitions (league_id, competition_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        """,
        [(league_id, competition_id) for competition_id in competition_ids],
    )
