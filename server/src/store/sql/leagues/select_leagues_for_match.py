from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_leagues_for_match(conn: Connection, match_id: UUID) -> list[UUID]:
    rows = await conn.fetch(
        """
        SELECT DISTINCT l.league_id
        FROM matches m
        JOIN league_competitions lc ON lc.competition_id = m.competition_id
        JOIN leagues l ON l.league_id = lc.league_id
        WHERE m.match_id = $1
          AND l.status IN ('active', 'paused', 'closed')
          AND m.kickoff_at >= l.starts_at
          AND m.kickoff_at <= l.ends_at
        ORDER BY l.league_id
        """,
        match_id,
    )
    return [row["league_id"] for row in rows]
