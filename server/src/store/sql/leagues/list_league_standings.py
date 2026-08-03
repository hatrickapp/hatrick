from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

async def list_league_standings(conn: Connection, league_id: UUID, viewer_user_id: UUID, cursor: UUID | None, limit: int) -> list[LeagueStandingRow]:
    cursor_rank = None
    if cursor is not None:
        cursor_rank = await conn.fetchval(
            """
            SELECT rank
            FROM league_standings
            WHERE league_id = $1
              AND user_id = $2
            """,
            league_id,
            cursor,
        )
    rows = await conn.fetch(
        """
        SELECT
            ls.user_id,
            u.username,
            CASE WHEN u.show_name_publicly THEN u.name ELSE NULL END AS name,
            u.avatar_url,
            u.plan,
            ls.rank,
            ls.points,
            ls.predictions_count,
            ls.correct_outcomes,
            ls.correct_btts,
            ls.correct_scorers,
            ls.hatricks,
            (ls.user_id = $2)::bool AS is_current_user
        FROM league_standings ls
        JOIN users u ON u.user_id = ls.user_id
        WHERE ls.league_id = $1
          AND ($3::int IS NULL OR ls.rank > $3::int)
        ORDER BY ls.rank ASC, ls.user_id ASC
        LIMIT $4
        """,
        league_id,
        viewer_user_id,
        cursor_rank,
        limit,
    )
    return [
        LeagueStandingRow(
            user_id=row["user_id"],
            username=row["username"],
            name=row["name"],
            avatar_url=row["avatar_url"],
            plan=row["plan"],
            rank=row["rank"],
            points=row["points"],
            predictions_count=row["predictions_count"],
            correct_outcomes=row["correct_outcomes"],
            correct_btts=row["correct_btts"],
            correct_scorers=row["correct_scorers"],
            hatricks=row["hatricks"],
            is_current_user=row["is_current_user"],
        )
        for row in rows
    ]
