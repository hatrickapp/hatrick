from datetime import timedelta

from fastapi import APIRouter, HTTPException, Response

from src.app.routers.authentication.cookie_policy import remove_session_cookie
from src.app.routers.authentication.responses.profile_rank import profile_rank
from src.app.routers.classes.authentication_classes import AuthenticatedUserResponse, CompleteDeletionRequest, CompleteLogoutRequest, InitiateDeletionRequest, MobileAuthResponse, NativeAppleOAuthRequest, NativeGoogleOAuthRequest, ProfileNameResponse, ProfileTimezoneResponse, ProfileUsernameResponse, ProfileVisibilityResponse, UpdateProfileNameRequest, UpdateProfileTimezoneRequest, UpdateProfileUsernameRequest, UpdateProfileVisibilityRequest, UserIdResponse, UserProfileResponse, UserProfileStats, UserSessionItem, UserSessionsResponse
from src.app.routers.classes.base import BaseResponse
from src.app.routers.dependencies.router_dependencies import CountryDep, EventPublisherDep, HTTPDep, LuaManagerDep, OsDep, PoolDep, RedisDep, SessionTokenDep, UserDep
from src.logic.authentication.deletion.complete_deletion import complete_deletion
from src.logic.authentication.deletion.initiate_deletion import initiate_deletion
from src.logic.authentication.login.oauth.apple.complete_apple_oauth import complete_native_apple_oauth
from src.logic.authentication.login.oauth.google.complete_google_oauth import complete_native_google_oauth
from src.logic.authentication.logout.logout import logout
from src.logic.authentication.profile.update_profile_name import update_profile_name_logic
from src.logic.authentication.profile.update_profile_timezone import update_profile_timezone_logic
from src.logic.authentication.profile.update_profile_username import update_profile_username_logic
from src.logic.authentication.profile.update_public_name_visibility import update_public_name_visibility_logic
from src.logic.authentication.shared.resolve_current_user import resolve_current_user
from src.logic.authentication.shared.ui.get_auth_functions import get_user_profile_data, get_user_sessions_data

router = APIRouter(prefix="/v1")


# --- Account Deletion ---

@router.post("/auth/account/delete/initiate", response_model=UserIdResponse)
async def deletion_initiate(body: InitiateDeletionRequest, cache: RedisDep, lua_manager: LuaManagerDep, pool: PoolDep, user_id: UserDep, country: CountryDep):
    result = await initiate_deletion(pool, cache, lua_manager, user_id, country)
    return UserIdResponse(user_id=result.user_id)

@router.post("/auth/account/delete/complete", response_model=BaseResponse)
async def deletion_complete(body: CompleteDeletionRequest, cache: RedisDep, lua_manager: LuaManagerDep, pool: PoolDep, user_id: UserDep, country: CountryDep, publisher: EventPublisherDep):
    await complete_deletion(pool, cache, lua_manager, user_id, body.otp, country, publisher)
    return BaseResponse()

# --- User Resolution ---

@router.get("/auth/user/me", response_model=AuthenticatedUserResponse)
async def get_current_user_endpoint(
    pool: PoolDep,
    session_token: SessionTokenDep,
):
    user = await resolve_current_user(pool, session_token)
    if user is None:
        raise HTTPException(status_code=401, detail="UNAUTHORIZED")
    return AuthenticatedUserResponse(user=user)

@router.get("/auth/user/profile", response_model=UserProfileResponse)
async def get_user_profile_endpoint(pool: PoolDep, user_id: UserDep):
    profile = await get_user_profile_data(pool, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="NOT_FOUND")
    return UserProfileResponse(
        user_id=profile.user_id,
        email=profile.email,
        name=profile.name,
        username=profile.username,
        username_changed_at=profile.username_changed_at,
        username_next_change_at=profile.username_changed_at + timedelta(days=30) if profile.username_changed_at and profile.username_setup_completed else None,
        username_setup_completed=profile.username_setup_completed,
        show_name_publicly=profile.show_name_publicly,
        followers_count=profile.followers_count,
        following_count=profile.following_count,
        account_status=profile.account_status,
        plan=profile.plan,
        provider=profile.provider,
        avatar_url=profile.avatar_url,
        timezone=profile.timezone,
        created_at=profile.created_at,
        stats=UserProfileStats(
            total_points=profile.total_points,
            predictions_count=profile.predictions_count,
            settled_predictions=profile.settled_predictions,
            correct_outcomes=profile.correct_outcomes,
            correct_btts=profile.correct_btts,
            correct_scorers=profile.correct_scorers,
            hatricks=profile.hatricks,
        ),
        rank=profile_rank(
            profile.rank_key,
            profile.rank_name,
            profile.rank_min_points,
            profile.rank_icon_key,
            profile.rank_color_hex,
        ),
        next_rank=profile_rank(
            profile.next_rank_key,
            profile.next_rank_name,
            profile.next_rank_min_points,
            profile.next_rank_icon_key,
            profile.next_rank_color_hex,
        ),
        points_to_next_rank=profile.points_to_next_rank,
    )

@router.post("/auth/user/profile/name", response_model=ProfileNameResponse)
async def update_user_profile_name_endpoint(body: UpdateProfileNameRequest, pool: PoolDep, user_id: UserDep):
    name = await update_profile_name_logic(pool, user_id, body.name)
    return ProfileNameResponse(name=name)

@router.post("/auth/user/profile/username", response_model=ProfileUsernameResponse)
async def update_user_profile_username_endpoint(body: UpdateProfileUsernameRequest, pool: PoolDep, user_id: UserDep):
    username = await update_profile_username_logic(pool, user_id, body.username)
    return ProfileUsernameResponse(username=username)

@router.post("/auth/user/profile/visibility", response_model=ProfileVisibilityResponse)
async def update_user_profile_visibility_endpoint(body: UpdateProfileVisibilityRequest, pool: PoolDep, user_id: UserDep):
    show_name_publicly = await update_public_name_visibility_logic(pool, user_id, body.show_name_publicly)
    return ProfileVisibilityResponse(show_name_publicly=show_name_publicly)

@router.post("/auth/user/profile/timezone", response_model=ProfileTimezoneResponse)
async def update_user_profile_timezone_endpoint(body: UpdateProfileTimezoneRequest, pool: PoolDep, user_id: UserDep):
    timezone = await update_profile_timezone_logic(pool, user_id, body.timezone)
    return ProfileTimezoneResponse(timezone=timezone)

@router.get("/auth/user/sessions", response_model=UserSessionsResponse)
async def get_user_sessions_endpoint(pool: PoolDep, user_id: UserDep):
    sessions = await get_user_sessions_data(pool, user_id)
    return UserSessionsResponse(
        sessions=[
            UserSessionItem(session_id=s.session_id, country=s.country, created_at=s.created_at, expires_at=s.expires_at)
            for s in sessions
        ]
    )

# --- Logout ---

@router.post("/auth/logout", response_model=BaseResponse)
async def logout_complete(
    response: Response,
    body: CompleteLogoutRequest,
    pool: PoolDep,
    cache: RedisDep,
    lua_manager: LuaManagerDep,
    session_token: SessionTokenDep,
    publisher: EventPublisherDep,
    os: OsDep,
):
    await logout(pool, cache, lua_manager, session_token, publisher)
    if os == "web":
        remove_session_cookie(response)
    return BaseResponse()

# --- OAuth ---

@router.post("/auth/oauth/google/native", response_model=MobileAuthResponse)
async def google_native_oauth_callback(
    body: NativeGoogleOAuthRequest,
    pool: PoolDep,
    cache: RedisDep,
    lua_manager: LuaManagerDep,
    http: HTTPDep,
    country: CountryDep,
    publisher: EventPublisherDep,
    os: OsDep,
):
    if os != "mobile":
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    result = await complete_native_google_oauth(pool, cache, lua_manager, http, body.id_token, country, publisher)
    return MobileAuthResponse(session_token=result.session_token, expires_at=result.expires_at)

@router.post("/auth/oauth/apple/native", response_model=MobileAuthResponse)
async def apple_native_oauth_callback(
    body: NativeAppleOAuthRequest,
    pool: PoolDep,
    cache: RedisDep,
    lua_manager: LuaManagerDep,
    http: HTTPDep,
    country: CountryDep,
    publisher: EventPublisherDep,
    os: OsDep,
):
    if os != "mobile":
        raise HTTPException(status_code=404, detail="NOT_FOUND")

    result = await complete_native_apple_oauth(
        pool,
        cache,
        lua_manager,
        http,
        body.identity_token,
        body.nonce,
        body.email,
        body.full_name,
        country,
        publisher,
    )
    return MobileAuthResponse(session_token=result.session_token, expires_at=result.expires_at)
