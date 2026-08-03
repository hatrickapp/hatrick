from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def insert_league_member(conn: Connection, league_id: UUID, user_id: UUID, score_starts_at: datetime) -> None:
    await conn.execute(
        """
        INSERT INTO league_members (league_member_id, league_id, user_id, score_starts_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (league_id, user_id) DO UPDATE
        SET status = 'active',
            score_starts_at = EXCLUDED.score_starts_at,
            joined_at = NOW(),
            left_at = NULL
        """,
        uuid7(),
        league_id,
        user_id,
        score_starts_at,
    )
