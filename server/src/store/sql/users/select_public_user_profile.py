from dataclasses import dataclass
from uuid import UUID

from asyncpg import Connection

from src.store.sql.users.map_stats import map_stats
from src.store.sql.users.upsert_best_global_rank import upsert_best_global_rank

@dataclass
class PublicUserStats:
    total_points: int
    predictions_count: int
    settled_predictions: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
@dataclass
class PublicUserSearchItem:
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    plan: str
@dataclass
class PublicUserProfile:
    user_id: UUID
    username: str
    name: str | None
    avatar_url: str | None
    followers_count: int
    following_count: int
    is_following: bool
    plan: str
    stats: PublicUserStats
    global_rank: int
    total_ranked_users: int
    best_global_rank: int | None
    rank_key: str | None
    rank_name: str | None
    rank_min_points: int | None
    rank_icon_key: str | None
    rank_color_hex: str | None
    next_rank_key: str | None
    next_rank_name: str | None
    next_rank_min_points: int | None
    next_rank_icon_key: str | None
    next_rank_color_hex: str | None
    points_to_next_rank: int | None

async def select_public_user_profile(conn: Connection, username: str, viewer_user_id: UUID) -> PublicUserProfile | None:
    query = """
    WITH profile_stats AS (
        SELECT
            u.user_id,
            COALESCE(SUM(p.points), 0)::int AS total_points,
            COUNT(p.prediction_id)::int AS predictions_count,
            COUNT(p.prediction_id) FILTER (WHERE p.status = 'settled')::int AS settled_predictions,
            COUNT(p.prediction_id) FILTER (WHERE p.outcome_correct = TRUE)::int AS correct_outcomes,
            COUNT(p.prediction_id) FILTER (WHERE p.btts_correct = TRUE)::int AS correct_btts,
            COUNT(p.prediction_id) FILTER (WHERE p.scorer_correct = TRUE)::int AS correct_scorers,
            COUNT(p.prediction_id) FILTER (WHERE p.hatrick_bonus_awarded = TRUE)::int AS hatricks
        FROM users u
        LEFT JOIN predictions p ON p.user_id = u.user_id
        WHERE u.is_deleted = FALSE
          AND u.username_setup_completed = TRUE
        GROUP BY u.user_id
    ),
    ranked AS (
        SELECT
            u.user_id,
            u.username,
            CASE WHEN u.show_name_publicly THEN u.name ELSE NULL END AS name,
            u.avatar_url,
            (SELECT COUNT(*)::int FROM user_follows uf WHERE uf.followed_user_id = u.user_id) AS followers_count,
            (SELECT COUNT(*)::int FROM user_follows uf WHERE uf.follower_user_id = u.user_id) AS following_count,
            EXISTS (
                SELECT 1
                FROM user_follows uf
                WHERE uf.follower_user_id = $2
                  AND uf.followed_user_id = u.user_id
            ) AS is_following,
            u.plan,
            ps.total_points,
            ps.predictions_count,
            ps.settled_predictions,
            ps.correct_outcomes,
            ps.correct_btts,
            ps.correct_scorers,
            ps.hatricks,
            us.best_global_rank,
            current_rank.rank_key,
            current_rank.name AS rank_name,
            current_rank.min_points AS rank_min_points,
            current_rank.icon_key AS rank_icon_key,
            current_rank.color_hex AS rank_color_hex,
            next_rank.rank_key AS next_rank_key,
            next_rank.name AS next_rank_name,
            next_rank.min_points AS next_rank_min_points,
            next_rank.icon_key AS next_rank_icon_key,
            next_rank.color_hex AS next_rank_color_hex,
            CASE
                WHEN next_rank.min_points IS NULL THEN NULL
                ELSE GREATEST(next_rank.min_points - ps.total_points, 0)
            END AS points_to_next_rank,
            ROW_NUMBER() OVER (
                ORDER BY
                    ps.total_points DESC,
                    ps.hatricks DESC,
                    ps.correct_scorers DESC,
                    u.created_at ASC,
                    u.user_id ASC
            )::int AS global_rank,
            COUNT(*) OVER ()::int AS total_ranked_users
        FROM users u
        JOIN profile_stats ps ON ps.user_id = u.user_id
        LEFT JOIN user_stats us ON us.user_id = u.user_id
        LEFT JOIN LATERAL (
            SELECT rank_key, name, min_points, icon_key, color_hex
            FROM prediction_ranks
            WHERE is_active = TRUE
              AND min_points <= ps.total_points
            ORDER BY min_points DESC
            LIMIT 1
        ) current_rank ON TRUE
        LEFT JOIN LATERAL (
            SELECT rank_key, name, min_points, icon_key, color_hex
            FROM prediction_ranks
            WHERE is_active = TRUE
              AND min_points > ps.total_points
            ORDER BY min_points ASC
            LIMIT 1
        ) next_rank ON TRUE
        WHERE u.is_deleted = FALSE
          AND u.username_setup_completed = TRUE
    )
    SELECT
        user_id,
        username,
        name,
        avatar_url,
        followers_count,
        following_count,
        is_following,
        plan,
        total_points,
        predictions_count,
        settled_predictions,
        correct_outcomes,
        correct_btts,
        correct_scorers,
        hatricks,
        global_rank,
        total_ranked_users,
        best_global_rank,
        rank_key,
        rank_name,
        rank_min_points,
        rank_icon_key,
        rank_color_hex,
        next_rank_key,
        next_rank_name,
        next_rank_min_points,
        next_rank_icon_key,
        next_rank_color_hex,
        points_to_next_rank
    FROM ranked
    WHERE lower(username) = $1
    LIMIT 1
    """
    row = await conn.fetchrow(query, username, viewer_user_id)
    if row is None:
        return None
    best_global_rank = await upsert_best_global_rank(conn, row["user_id"], row["global_rank"])

    return PublicUserProfile(
        user_id=row["user_id"],
        username=row["username"],
        name=row["name"],
        avatar_url=row["avatar_url"],
        followers_count=row["followers_count"],
        following_count=row["following_count"],
        is_following=row["is_following"],
        plan=row["plan"],
        stats=map_stats(row),
        global_rank=row["global_rank"],
        total_ranked_users=row["total_ranked_users"],
        best_global_rank=best_global_rank,
        rank_key=row["rank_key"],
        rank_name=row["rank_name"],
        rank_min_points=row["rank_min_points"],
        rank_icon_key=row["rank_icon_key"],
        rank_color_hex=row["rank_color_hex"],
        next_rank_key=row["next_rank_key"],
        next_rank_name=row["next_rank_name"],
        next_rank_min_points=row["next_rank_min_points"],
        next_rank_icon_key=row["next_rank_icon_key"],
        next_rank_color_hex=row["next_rank_color_hex"],
        points_to_next_rank=row["points_to_next_rank"],
    )
