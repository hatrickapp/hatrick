from datetime import date
from uuid import UUID

from fastapi import APIRouter

from server.src.app.routers.classes.sports_classes import CompetitionsResponse, MatchDetailResponse, MatchesResponse
from server.src.app.routers.dependencies.router_dependencies import PoolDep, UserDep
from server.src.logic.sports.get_sports_data import get_competitions, get_match_detail_for_user, get_matches_for_user
from server.src.logic.sports.responses import competition_item, match_detail_response, match_item

router = APIRouter(prefix="/v1/sports")


@router.get("/competitions", response_model=CompetitionsResponse)
async def competitions_endpoint(pool: PoolDep):
    competitions = await get_competitions(pool)
    return CompetitionsResponse(competitions=[competition_item(competition) for competition in competitions])


@router.get("/matches", response_model=MatchesResponse)
async def matches_endpoint(
    pool: PoolDep,
    user_id: UserDep,
    competition_id: UUID | None = None,
    date: date | None = None,
):
    matches = await get_matches_for_user(pool, user_id, competition_id, date)
    return MatchesResponse(matches=[match_item(match) for match in matches])


@router.get("/matches/{match_id}", response_model=MatchDetailResponse)
async def match_detail_endpoint(match_id: UUID, pool: PoolDep, user_id: UserDep):
    match, players, goals = await get_match_detail_for_user(pool, user_id, match_id)
    return match_detail_response(match, players, goals)
