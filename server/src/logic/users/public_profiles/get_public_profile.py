from uuid import UUID

from asyncpg import Pool

from src.logic.predictions.prediction_actions import ranking_accuracy_rows, ranking_rules
from src.logic.users.public_profiles.public_profile_ranking import PublicProfileRanking
from src.store.sql.users.select_public_user_profile import select_public_user_profile

async def get_public_profile(pool: Pool, username: str, viewer_user_id: UUID) -> PublicProfileRanking | None:
    normalized = username.strip().lower()
    async with pool.acquire() as conn:
        profile = await select_public_user_profile(conn, normalized, viewer_user_id)
    if profile is None:
        return None

    return PublicProfileRanking(
        user_id=profile.user_id,
        username=profile.username,
        name=profile.name,
        avatar_url=profile.avatar_url,
        followers_count=profile.followers_count,
        following_count=profile.following_count,
        is_following=profile.is_following,
        plan=profile.plan,
        stats=profile.stats,
        global_rank=profile.global_rank,
        total_ranked_users=profile.total_ranked_users,
        best_global_rank=profile.best_global_rank,
        rank_key=profile.rank_key,
        rank_name=profile.rank_name,
        rank_min_points=profile.rank_min_points,
        rank_icon_key=profile.rank_icon_key,
        rank_color_hex=profile.rank_color_hex,
        next_rank_key=profile.next_rank_key,
        next_rank_name=profile.next_rank_name,
        next_rank_min_points=profile.next_rank_min_points,
        next_rank_icon_key=profile.next_rank_icon_key,
        next_rank_color_hex=profile.next_rank_color_hex,
        points_to_next_rank=profile.points_to_next_rank,
        top_percentage=round((profile.global_rank / profile.total_ranked_users) * 100, 2) if profile.total_ranked_users else 100.0,
        accuracy=ranking_accuracy_rows(
            profile.stats.settled_predictions,
            profile.stats.correct_outcomes,
            profile.stats.correct_btts,
            profile.stats.correct_scorers,
            profile.stats.hatricks,
        ),
        ranking_rules=ranking_rules(),
    )
