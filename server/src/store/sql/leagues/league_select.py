from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from server.src.store.sql.sports.read_models import CompetitionRow

def league_select(viewer_user_id: UUID) -> str:
    del viewer_user_id
    return """
    SELECT
        l.league_id,
        l.host_user_id,
        hu.username AS host_username,
        CASE WHEN hu.show_name_publicly THEN hu.name ELSE NULL END AS host_name,
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
        COUNT(lm_all.user_id) FILTER (WHERE lm_all.status = 'active')::int AS member_count,
        (l.host_user_id = $1)::bool AS is_host,
        user_standing.rank AS user_rank,
        user_standing.points AS user_points
    FROM leagues l
    JOIN users hu ON hu.user_id = l.host_user_id
    JOIN league_members lm_viewer
      ON lm_viewer.league_id = l.league_id
     AND lm_viewer.user_id = $1
     AND lm_viewer.status = 'active'
    LEFT JOIN league_members lm_all
      ON lm_all.league_id = l.league_id
    LEFT JOIN league_standings user_standing
      ON user_standing.league_id = l.league_id
     AND user_standing.user_id = $1
    WHERE l.status != 'deleted'
    """
