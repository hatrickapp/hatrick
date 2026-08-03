from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def insert_league(
    conn: Connection,
    host_user_id: UUID,
    name: str,
    starts_at: datetime,
    ends_at: datetime,
    include_existing_points: bool,
    max_members: int,
    scoring: LeagueScoringSettings,
) -> UUID:
    league_id = uuid7()
    await conn.execute(
        """
        INSERT INTO leagues (
            league_id,
            host_user_id,
            name,
            starts_at,
            ends_at,
            include_existing_points,
            max_members,
            include_outcome_points,
            include_btts_points,
            include_scorer_points,
            include_hatrick_bonus,
            only_hatricks
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """,
        league_id,
        host_user_id,
        name,
        starts_at,
        ends_at,
        include_existing_points,
        max_members,
        scoring.include_outcome_points,
        scoring.include_btts_points,
        scoring.include_scorer_points,
        scoring.include_hatrick_bonus,
        scoring.only_hatricks,
    )
    return league_id
