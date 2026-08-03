from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from server.src.app.routers.classes.authentication_classes import UserProfileRank, UserProfileStats
from server.src.app.routers.classes.prediction_classes import RankingAccuracyItem, RankingItem
from server.src.app.routers.classes.user_classes import FollowListResponse, FollowStatusResponse, FollowUserItem, PublicUserProfileResponse, PublicUserSearchItem, PublicUserSearchResponse
from server.src.app.routers.dependencies.router_dependencies import PoolDep, UserDep
from server.src.app.routers.realtime.realtime_router import notify_profile_refresh_users
from server.src.logic.users.public_profiles.follow_public_user import follow_public_user
from server.src.logic.users.public_profiles.get_followers import get_followers
from server.src.logic.users.public_profiles.get_following import get_following
from server.src.logic.users.public_profiles.get_public_profile import get_public_profile
from server.src.logic.users.public_profiles.search_users import search_users
from server.src.logic.users.public_profiles.unfollow_public_user import unfollow_public_user

router = APIRouter(prefix="/v1")


@router.get("/users/search", response_model=PublicUserSearchResponse)
async def search_users_endpoint(
    pool: PoolDep,
    user_id: UserDep,
    q: str = Query(default="", min_length=0, max_length=20),
    cursor: UUID | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=20),
):
    del user_id
    rows = await search_users(pool, q, cursor, limit)
    return PublicUserSearchResponse(
        users=[
            PublicUserSearchItem(
                user_id=row.user_id,
                username=row.username,
                name=row.name,
                avatar_url=row.avatar_url,
                plan=row.plan,
            )
            for row in rows
        ],
        next_cursor=rows[-1].user_id if len(rows) == limit else None,
    )


@router.post("/users/{username}/follow", response_model=FollowStatusResponse)
async def follow_user_endpoint(username: str, pool: PoolDep, user_id: UserDep):
    result = await follow_public_user(pool, user_id, username)
    if result is None:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    await notify_profile_refresh_users([user_id])
    return FollowStatusResponse(
        followers_count=result.followers_count,
        following_count=result.following_count,
        is_following=result.is_following,
    )


@router.post("/users/{username}/unfollow", response_model=FollowStatusResponse)
async def unfollow_user_endpoint(username: str, pool: PoolDep, user_id: UserDep):
    result = await unfollow_public_user(pool, user_id, username)
    if result is None:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    await notify_profile_refresh_users([user_id])
    return FollowStatusResponse(
        followers_count=result.followers_count,
        following_count=result.following_count,
        is_following=result.is_following,
    )


@router.get("/users/{username}/followers", response_model=FollowListResponse)
async def followers_endpoint(
    username: str,
    pool: PoolDep,
    user_id: UserDep,
    q: str = Query(default="", min_length=0, max_length=20),
    cursor: UUID | None = Query(default=None),
    limit: int = Query(default=15, ge=1, le=30),
):
    rows = await get_followers(pool, username, user_id, q, cursor, limit)
    return _follow_list_response(rows, limit)


@router.get("/users/{username}/following", response_model=FollowListResponse)
async def following_endpoint(
    username: str,
    pool: PoolDep,
    user_id: UserDep,
    q: str = Query(default="", min_length=0, max_length=20),
    cursor: UUID | None = Query(default=None),
    limit: int = Query(default=15, ge=1, le=30),
):
    rows = await get_following(pool, username, user_id, q, cursor, limit)
    return _follow_list_response(rows, limit)


@router.get("/users/{username}", response_model=PublicUserProfileResponse)
async def public_user_profile_endpoint(username: str, pool: PoolDep, user_id: UserDep):
    profile = await get_public_profile(pool, username, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    return PublicUserProfileResponse(
        user_id=profile.user_id,
        username=profile.username,
        name=profile.name,
        avatar_url=profile.avatar_url,
        followers_count=profile.followers_count,
        following_count=profile.following_count,
        is_following=profile.is_following,
        plan=profile.plan,
        stats=UserProfileStats(
            total_points=profile.stats.total_points,
            predictions_count=profile.stats.predictions_count,
            settled_predictions=profile.stats.settled_predictions,
            correct_outcomes=profile.stats.correct_outcomes,
            correct_btts=profile.stats.correct_btts,
            correct_scorers=profile.stats.correct_scorers,
            hatricks=profile.stats.hatricks,
        ),
        ranking=RankingItem(
            user_id=profile.user_id,
            name=profile.name,
            points=profile.stats.total_points,
            predictions_count=profile.stats.predictions_count,
            settled_predictions=profile.stats.settled_predictions,
            correct_outcomes=profile.stats.correct_outcomes,
            correct_btts=profile.stats.correct_btts,
            correct_scorers=profile.stats.correct_scorers,
            hatricks=profile.stats.hatricks,
            global_rank=profile.global_rank,
            total_ranked_users=profile.total_ranked_users,
            best_global_rank=profile.best_global_rank,
        ),
        rank=UserProfileRank(
            rank_key=profile.rank_key,
            name=profile.rank_name,
            min_points=profile.rank_min_points,
            icon_key=profile.rank_icon_key,
            color_hex=profile.rank_color_hex,
        )
        if profile.rank_key and profile.rank_name and profile.rank_min_points is not None and profile.rank_icon_key and profile.rank_color_hex
        else None,
        next_rank=UserProfileRank(
            rank_key=profile.next_rank_key,
            name=profile.next_rank_name,
            min_points=profile.next_rank_min_points,
            icon_key=profile.next_rank_icon_key,
            color_hex=profile.next_rank_color_hex,
        )
        if profile.next_rank_key and profile.next_rank_name and profile.next_rank_min_points is not None and profile.next_rank_icon_key and profile.next_rank_color_hex
        else None,
        points_to_next_rank=profile.points_to_next_rank,
        top_percentage=profile.top_percentage,
        accuracy=[
            RankingAccuracyItem(
                key=item.key,
                label=item.label,
                correct=item.correct,
                total=item.total,
                ratio_percent=item.ratio_percent,
            )
            for item in profile.accuracy
        ],
        ranking_rules=profile.ranking_rules,
    )


def _follow_list_response(rows, limit: int) -> FollowListResponse:
    return FollowListResponse(
        users=[
            FollowUserItem(
                user_id=row.user_id,
                username=row.username,
                name=row.name,
                avatar_url=row.avatar_url,
                is_following=row.is_following,
            )
            for row in rows
        ],
        next_cursor=rows[-1].cursor_id if len(rows) == limit else None,
    )
