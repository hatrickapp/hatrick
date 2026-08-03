from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from src.app.crypto.encryption.aes_decrypt import decrypt

@dataclass
class UserProfile:
    user_id: UUID
    email: str
    name: str | None
    username: str
    username_changed_at: datetime | None
    username_setup_completed: bool
    show_name_publicly: bool
    followers_count: int
    following_count: int
    account_status: str
    plan: str
    provider: str
    avatar_url: str | None
    timezone: str
    created_at: datetime
    total_points: int
    predictions_count: int
    settled_predictions: int
    correct_outcomes: int
    correct_btts: int
    correct_scorers: int
    hatricks: int
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

async def get_user_profile(conn: Connection, user_id: UUID) -> UserProfile | None:
    query = """
    WITH profile_stats AS (
        SELECT
            $1::uuid AS user_id,
            COALESCE(SUM(points), 0)::int AS total_points,
            COUNT(*)::int AS predictions_count,
            COUNT(*) FILTER (WHERE status = 'settled')::int AS settled_predictions,
            COUNT(*) FILTER (WHERE outcome_correct = TRUE)::int AS correct_outcomes,
            COUNT(*) FILTER (WHERE btts_correct = TRUE)::int AS correct_btts,
            COUNT(*) FILTER (WHERE scorer_correct = TRUE)::int AS correct_scorers,
            COUNT(*) FILTER (WHERE hatrick_bonus_awarded = TRUE)::int AS hatricks
        FROM predictions
        WHERE user_id = $1
    )
    SELECT
        u.user_id,
        u.email_encrypted,
        u.name,
        u.username,
        u.username_changed_at,
        u.username_setup_completed,
        u.show_name_publicly,
        (SELECT COUNT(*)::int FROM user_follows uf WHERE uf.followed_user_id = u.user_id) AS followers_count,
        (SELECT COUNT(*)::int FROM user_follows uf WHERE uf.follower_user_id = u.user_id) AS following_count,
        u.account_status,
        u.plan,
        u.provider,
        u.avatar_url,
        u.timezone,
        u.created_at,
        COALESCE(ps.total_points, 0) AS total_points,
        COALESCE(ps.predictions_count, 0) AS predictions_count,
        COALESCE(ps.settled_predictions, 0) AS settled_predictions,
        COALESCE(ps.correct_outcomes, 0) AS correct_outcomes,
        COALESCE(ps.correct_btts, 0) AS correct_btts,
        COALESCE(ps.correct_scorers, 0) AS correct_scorers,
        COALESCE(ps.hatricks, 0) AS hatricks,
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
            ELSE GREATEST(next_rank.min_points - COALESCE(ps.total_points, 0), 0)
        END AS points_to_next_rank
    FROM users u
    LEFT JOIN profile_stats ps ON ps.user_id = u.user_id
    LEFT JOIN LATERAL (
        SELECT rank_key, name, min_points, icon_key, color_hex
        FROM prediction_ranks
        WHERE is_active = TRUE
          AND min_points <= COALESCE(ps.total_points, 0)
        ORDER BY min_points DESC
        LIMIT 1
    ) current_rank ON TRUE
    LEFT JOIN LATERAL (
        SELECT rank_key, name, min_points, icon_key, color_hex
        FROM prediction_ranks
        WHERE is_active = TRUE
          AND min_points > COALESCE(ps.total_points, 0)
        ORDER BY min_points ASC
        LIMIT 1
    ) next_rank ON TRUE
    WHERE u.user_id = $1
      AND u.is_deleted = FALSE
    """

    row = await conn.fetchrow(query, user_id)

    if row is None:
        return None

    return UserProfile(
        user_id=row["user_id"],
        email=decrypt(row["email_encrypted"]),
        name=row["name"],
        username=row["username"],
        username_changed_at=row["username_changed_at"],
        username_setup_completed=row["username_setup_completed"],
        show_name_publicly=row["show_name_publicly"],
        followers_count=row["followers_count"],
        following_count=row["following_count"],
        account_status=row["account_status"],
        plan=row["plan"],
        provider=row["provider"],
        avatar_url=row["avatar_url"],
        timezone=row["timezone"],
        created_at=row["created_at"],
        total_points=row["total_points"],
        predictions_count=row["predictions_count"],
        settled_predictions=row["settled_predictions"],
        correct_outcomes=row["correct_outcomes"],
        correct_btts=row["correct_btts"],
        correct_scorers=row["correct_scorers"],
        hatricks=row["hatricks"],
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
