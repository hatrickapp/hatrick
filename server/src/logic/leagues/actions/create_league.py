from datetime import datetime
from uuid import UUID

from asyncpg import Pool
import httpx

from server.src.app.errors.domains.league_errors import InvalidLeagueNameError, InvalidLeagueSettingsError, LeagueLimitReachedError, LeagueNotFoundError
from server.src.app.validation.validate_league import validate_league_name
from server.src.logic.billing.revenuecat import sync_revenuecat_customer_if_ready
from server.src.logic.leagues.actions.refresh_league_standings import refresh_league_standings
from server.src.logic.leagues.actions.validate_create_settings import validate_create_settings
from server.src.store.sql.app_config.select_default_league_scoring_preset import select_default_league_scoring_preset
from server.src.store.sql.app_config.select_league_limits import select_league_limits
from server.src.store.sql.app_config.select_plan_limits import select_plan_limits
from server.src.store.sql.leagues.insert_league import insert_league
from server.src.store.sql.leagues.insert_league_competitions import insert_league_competitions
from server.src.store.sql.leagues.insert_league_member import insert_league_member
from server.src.store.sql.leagues.read_models import LeagueRow, LeagueScoringSettings
from server.src.store.sql.leagues.select_all_enabled_competitions import select_all_enabled_competitions
from server.src.store.sql.leagues.select_enabled_competitions import select_enabled_competitions
from server.src.store.sql.leagues.select_league_detail import select_league_detail
from server.src.store.sql.leagues.select_user_plan_and_active_hosted_count import select_user_plan_and_active_hosted_count

async def create_league(
    pool: Pool,
    http: httpx.AsyncClient,
    host_user_id: UUID,
    name: str,
    competition_ids: list[UUID],
    scoring: LeagueScoringSettings,
    starts_at: datetime,
    ends_at: datetime,
    include_existing_points: bool,
    max_members: int,
) -> LeagueRow:
    valid_name, normalized_name = validate_league_name(name)
    if not valid_name:
        raise InvalidLeagueNameError(normalized_name)

    await sync_revenuecat_customer_if_ready(pool, http, host_user_id)

    async with pool.acquire() as conn:
        async with conn.transaction():
            plan_state = await select_user_plan_and_active_hosted_count(conn, host_user_id)
            if plan_state is None:
                raise LeagueNotFoundError()
            plan, active_count = plan_state
            plan_limits = await select_plan_limits(conn, plan)
            league_limits = await select_league_limits(conn)
            if plan_limits is None or league_limits is None:
                raise InvalidLeagueSettingsError("APP_CONFIG_MISSING")
            if active_count >= plan_limits["active_league_limit"]:
                raise LeagueLimitReachedError()

            if plan_limits["can_customize_competitions"]:
                validate_create_settings(competition_ids, scoring, starts_at, ends_at, max_members, league_limits)
                competitions = await select_enabled_competitions(conn, competition_ids)
                if len(competitions) != len(set(competition_ids)):
                    raise InvalidLeagueSettingsError("NO_COMPETITIONS")
            else:
                competitions = await select_all_enabled_competitions(conn)
                if not competitions:
                    raise InvalidLeagueSettingsError("NO_COMPETITIONS")
                competition_ids = [competition.competition_id for competition in competitions]

            if not plan_limits["can_customize_scoring"]:
                default_scoring = await select_default_league_scoring_preset(conn)
                if default_scoring is None:
                    raise InvalidLeagueSettingsError("APP_CONFIG_MISSING")
                scoring = LeagueScoringSettings(
                    include_outcome_points=default_scoring["include_outcome_points"],
                    include_btts_points=default_scoring["include_btts_points"],
                    include_scorer_points=default_scoring["include_scorer_points"],
                    include_hatrick_bonus=default_scoring["include_hatrick_bonus"],
                    only_hatricks=default_scoring["only_hatricks"],
                )

            if not plan_limits["can_count_existing_points"]:
                include_existing_points = False

            validate_create_settings(competition_ids, scoring, starts_at, ends_at, max_members, league_limits)

            league_id = await insert_league(
                conn,
                host_user_id=host_user_id,
                name=normalized_name,
                starts_at=starts_at,
                ends_at=ends_at,
                include_existing_points=include_existing_points,
                max_members=max_members,
                scoring=scoring,
            )
            await insert_league_competitions(conn, league_id, competition_ids)
            await insert_league_member(conn, league_id, host_user_id, starts_at)
            await refresh_league_standings(conn, league_id)
            league = await select_league_detail(conn, league_id, host_user_id)
            if league is None:
                raise LeagueNotFoundError()
            league.competitions = competitions
            return league
