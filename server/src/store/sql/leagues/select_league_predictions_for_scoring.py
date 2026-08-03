from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def select_league_predictions_for_scoring(conn: Connection, league_id: UUID) -> list[LeaguePredictionScoreRow]:
    rows = await conn.fetch(
        """
        SELECT
            lm.user_id,
            p.outcome_correct,
            p.btts_correct,
            p.scorer_correct,
            p.hatrick_bonus_awarded
        FROM leagues l
        JOIN league_members lm
          ON lm.league_id = l.league_id
         AND lm.status = 'active'
        JOIN predictions p
          ON p.user_id = lm.user_id
         AND p.status = 'settled'
        JOIN matches m
          ON m.match_id = p.match_id
         AND m.is_void = FALSE
         AND m.kickoff_at >= lm.score_starts_at
         AND m.kickoff_at <= l.ends_at
        JOIN league_competitions lc
          ON lc.league_id = l.league_id
         AND lc.competition_id = m.competition_id
        WHERE l.league_id = $1
        """,
        league_id,
    )
    return [
        LeaguePredictionScoreRow(
            user_id=row["user_id"],
            outcome_correct=row["outcome_correct"],
            btts_correct=row["btts_correct"],
            scorer_correct=row["scorer_correct"],
            hatrick_bonus_awarded=row["hatrick_bonus_awarded"],
        )
        for row in rows
    ]
