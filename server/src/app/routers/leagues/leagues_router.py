from uuid import UUID

from fastapi import APIRouter, Query

from src.app.routers.classes.base import BaseResponse
from src.app.routers.classes.league_classes import CreateLeagueInvitationRequest, CreateLeagueRequest, LeagueInvitationResponse, LeagueInvitationsResponse, LeagueLimitItem, LeagueResponse, LeagueScoringItem, LeagueScoringPresetItem, LeagueStandingsResponse, LeaguesConfigResponse, LeaguesHomeResponse, PlanLimitItem, PlusOfferingItem, UpdateLeagueRequest
from src.app.routers.dependencies.router_dependencies import HTTPDep, PoolDep, UserDep
from src.app.routers.leagues.responses.invitation_item import invitation_item
from src.app.routers.leagues.responses.league_item import league_item
from src.app.routers.leagues.responses.scoring_settings import scoring_settings
from src.app.routers.leagues.responses.standing_item import standing_item
from src.app.routers.realtime.realtime_router import notify_dashboard_refresh_users
from src.logic.leagues.actions.create_league import create_league
from src.logic.leagues.actions.get_league_detail import get_league_detail
from src.logic.leagues.actions.get_league_invitations import get_league_invitations
from src.logic.leagues.actions.get_league_standings import get_league_standings
from src.logic.leagues.actions.get_leagues_config import get_leagues_config
from src.logic.leagues.actions.get_leagues_home import get_leagues_home
from src.logic.leagues.actions.invite_user_to_league import invite_user_to_league
from src.logic.leagues.actions.join_league_invitation import join_league_invitation
from src.logic.leagues.actions.leave_league import leave_league
from src.logic.leagues.actions.reject_league_invitation import reject_league_invitation
from src.logic.leagues.actions.remove_league_member import remove_league_member
from src.logic.leagues.actions.update_league import update_league

router = APIRouter(prefix="/v1")


@router.get("/leagues", response_model=LeaguesHomeResponse)
async def leagues_home_endpoint(pool: PoolDep, user_id: UserDep):
    active, history = await get_leagues_home(pool, user_id)
    return LeaguesHomeResponse(
        active_leagues=[league_item(league) for league in active],
        history_leagues=[league_item(league) for league in history],
    )


@router.get("/leagues/config", response_model=LeaguesConfigResponse)
async def leagues_config_endpoint(pool: PoolDep, user_id: UserDep):
    del user_id
    plan_limits, league_limits, plus_offering, scoring_presets = await get_leagues_config(pool)
    return LeaguesConfigResponse(
        plan_limits={
            row["plan"]: PlanLimitItem(
                plan=row["plan"],
                active_league_limit=row["active_league_limit"],
                can_customize_competitions=row["can_customize_competitions"],
                can_customize_scoring=row["can_customize_scoring"],
                can_count_existing_points=row["can_count_existing_points"],
                can_change_username=row["can_change_username"],
                priority_support=row["priority_support"],
            )
            for row in plan_limits
        },
        league_limits=LeagueLimitItem(
            default_max_members=league_limits["default_max_members"],
            max_members=league_limits["max_members"],
            max_period_days=league_limits["max_period_days"],
            max_start_days_ahead=league_limits["max_start_days_ahead"],
        ),
        plus_offering=PlusOfferingItem(
            price_label=plus_offering["price_label"],
            cta_label=plus_offering["cta_label"],
            features=list(plus_offering["features"]),
        ),
        scoring_presets=[
            LeagueScoringPresetItem(
                preset_key=row["preset_key"],
                label=row["label"],
                description=row["description"],
                scoring=LeagueScoringItem(
                    include_outcome_points=row["include_outcome_points"],
                    include_btts_points=row["include_btts_points"],
                    include_scorer_points=row["include_scorer_points"],
                    include_hatrick_bonus=row["include_hatrick_bonus"],
                    only_hatricks=row["only_hatricks"],
                ),
                is_default=row["is_default"],
            )
            for row in scoring_presets
        ],
    )


@router.post("/leagues", response_model=LeagueResponse)
async def create_league_endpoint(body: CreateLeagueRequest, pool: PoolDep, http: HTTPDep, user_id: UserDep):
    league = await create_league(
        pool=pool,
        http=http,
        host_user_id=user_id,
        name=body.name,
        competition_ids=body.competition_ids,
        scoring=scoring_settings(body.scoring),
        starts_at=body.starts_at,
        ends_at=body.ends_at,
        include_existing_points=body.include_existing_points,
        max_members=body.max_members,
    )
    return LeagueResponse(league=league_item(league))


@router.get("/leagues/invitations", response_model=LeagueInvitationsResponse)
async def league_invitations_endpoint(pool: PoolDep, user_id: UserDep):
    invitations = await get_league_invitations(pool, user_id)
    return LeagueInvitationsResponse(invitations=[invitation_item(invitation) for invitation in invitations])


@router.post("/leagues/invitations/{league_invitation_id}/join", response_model=LeagueResponse)
async def join_league_invitation_endpoint(league_invitation_id: UUID, pool: PoolDep, user_id: UserDep):
    league, member_user_ids = await join_league_invitation(pool, user_id, league_invitation_id)
    await notify_dashboard_refresh_users(member_user_ids)
    return LeagueResponse(league=league_item(league))


@router.post("/leagues/invitations/{league_invitation_id}/reject", response_model=BaseResponse)
async def reject_league_invitation_endpoint(league_invitation_id: UUID, pool: PoolDep, user_id: UserDep):
    await reject_league_invitation(pool, user_id, league_invitation_id)
    return BaseResponse()


@router.get("/leagues/{league_id}", response_model=LeagueResponse)
async def league_detail_endpoint(league_id: UUID, pool: PoolDep, user_id: UserDep):
    league = await get_league_detail(pool, user_id, league_id)
    return LeagueResponse(league=league_item(league))


@router.get("/leagues/{league_id}/standings", response_model=LeagueStandingsResponse)
async def league_standings_endpoint(
    league_id: UUID,
    pool: PoolDep,
    user_id: UserDep,
    cursor: UUID | None = Query(default=None),
    limit: int = Query(default=15, ge=1, le=30),
):
    rows = await get_league_standings(pool, user_id, league_id, cursor, limit)
    return LeagueStandingsResponse(
        standings=[standing_item(row) for row in rows],
        next_cursor=rows[-1].user_id if len(rows) == limit else None,
    )


@router.post("/leagues/{league_id}/settings", response_model=LeagueResponse)
async def update_league_endpoint(league_id: UUID, body: UpdateLeagueRequest, pool: PoolDep, user_id: UserDep):
    league = await update_league(pool, user_id, league_id, body.ends_at, body.status)
    return LeagueResponse(league=league_item(league))


@router.post("/leagues/{league_id}/invitations", response_model=LeagueInvitationResponse)
async def create_league_invitation_endpoint(league_id: UUID, body: CreateLeagueInvitationRequest, pool: PoolDep, user_id: UserDep):
    invitation, member_user_ids = await invite_user_to_league(pool, user_id, league_id, body.user_id)
    await notify_dashboard_refresh_users([*member_user_ids, body.user_id])
    return LeagueInvitationResponse(invitation=invitation_item(invitation))


@router.post("/leagues/{league_id}/leave", response_model=BaseResponse)
async def leave_league_endpoint(league_id: UUID, pool: PoolDep, user_id: UserDep):
    member_user_ids = await leave_league(pool, user_id, league_id)
    await notify_dashboard_refresh_users(member_user_ids)
    return BaseResponse()


@router.post("/leagues/{league_id}/members/{member_user_id}/remove", response_model=LeagueResponse)
async def remove_league_member_endpoint(league_id: UUID, member_user_id: UUID, pool: PoolDep, user_id: UserDep):
    league, member_user_ids = await remove_league_member(pool, user_id, league_id, member_user_id)
    await notify_dashboard_refresh_users(member_user_ids)
    return LeagueResponse(league=league_item(league))
