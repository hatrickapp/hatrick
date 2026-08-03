from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_league_members_for_scoring(conn: Connection, league_id: UUID) -> list[LeagueMemberScoreRow]:
    rows = await conn.fetch(
        """
        SELECT user_id, joined_at, score_starts_at
        FROM league_members
        WHERE league_id = $1
          AND status = 'active'
        ORDER BY joined_at ASC, user_id ASC
        """,
        league_id,
    )
    return [LeagueMemberScoreRow(user_id=row["user_id"], joined_at=row["joined_at"], score_starts_at=row["score_starts_at"]) for row in rows]
