from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.map_league import map_league
from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.sports.read_models import CompetitionRow

async def select_league_detail_for_scoring(conn: Connection, league_id: UUID) -> LeagueRow | None:
    row = await conn.fetchrow(
        """
        SELECT
            l.league_id,
            l.host_user_id,
            u.username AS host_username,
            CASE WHEN u.show_name_publicly THEN u.name ELSE NULL END AS host_name,
            l.name,
            l.status,
            l.starts_at,
            l.ends_at,
            l.include_existing_points,
            l.max_members,
            l.include_outcome_points,
            l.include_btts_points,
            l.include_scorer_points,
            l.include_hatrick_bonus,
            l.only_hatricks,
            l.winner_user_id,
            l.finished_at,
            l.created_at,
            l.updated_at,
            0::int AS member_count,
            FALSE AS is_host,
            NULL::int AS user_rank,
            NULL::int AS user_points
        FROM leagues l
        JOIN users u ON u.user_id = l.host_user_id
        WHERE l.league_id = $1
          AND l.status != 'deleted'
        """,
        league_id,
    )
    if row is None:
        return None
    return map_league(row)
