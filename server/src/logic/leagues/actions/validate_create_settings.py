from datetime import datetime
from uuid import UUID

from server.src.app.errors.domains.league_errors import InvalidLeagueSettingsError
from server.src.app.validation.validate_league import validate_competition_ids, validate_league_period, validate_max_members
from server.src.store.sql.leagues.read_models import LeagueScoringSettings

def validate_create_settings(
    competition_ids: list[UUID],
    scoring: LeagueScoringSettings,
    starts_at: datetime,
    ends_at: datetime,
    max_members: int,
    league_limits,
) -> None:
    checks = [
        validate_competition_ids(competition_ids),
        validate_league_period(starts_at, ends_at, league_limits["max_period_days"], league_limits["max_start_days_ahead"]),
        validate_max_members(max_members, league_limits["max_members"]),
    ]
    for ok, reason in checks:
        if not ok:
            raise InvalidLeagueSettingsError(reason)
    if not (
        scoring.only_hatricks
        or scoring.include_outcome_points
        or scoring.include_btts_points
        or scoring.include_scorer_points
        or scoring.include_hatrick_bonus
    ):
        raise InvalidLeagueSettingsError("NO_SCORING_RULES")
