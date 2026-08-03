from datetime import UTC, datetime, timedelta
import re
from uuid import UUID

from server.src.app.validation.validate_username import OFFENSIVE_WORDS

LEAGUE_NAME_RE = re.compile(r"^[A-Za-z0-9 _.'&-]{3,60}$", re.ASCII)


def normalize_league_name(name: str) -> str:
    return " ".join(name.strip().split())


def validate_league_name(name: str) -> tuple[bool, str]:
    if not name or not isinstance(name, str):
        return False, "INVALID_LEAGUE_NAME"

    normalized = normalize_league_name(name)
    if not LEAGUE_NAME_RE.fullmatch(normalized):
        return False, "INVALID_LEAGUE_NAME"
    if any(word in normalized.lower() for word in OFFENSIVE_WORDS):
        return False, "OFFENSIVE_LEAGUE_NAME"

    return True, normalized


def validate_competition_ids(competition_ids: list[UUID]) -> tuple[bool, str]:
    if not competition_ids:
        return False, "NO_COMPETITIONS"
    if len(competition_ids) > 50:
        return False, "TOO_MANY_COMPETITIONS"
    if len(set(competition_ids)) != len(competition_ids):
        return False, "DUPLICATE_COMPETITIONS"
    return True, "OK"


def validate_league_period(starts_at: datetime, ends_at: datetime, max_period_days: int = 365, max_start_days_ahead: int = 365) -> tuple[bool, str]:
    now = datetime.now(UTC)
    normalized_start = _aware_utc(starts_at)
    normalized_end = _aware_utc(ends_at)

    if normalized_start.date() < now.date():
        return False, "START_IN_PAST"
    if normalized_start > now + timedelta(days=max_start_days_ahead):
        return False, "START_TOO_FAR"
    if normalized_end.date() <= now.date():
        return False, "END_TOO_SOON"
    if normalized_end <= normalized_start:
        return False, "END_BEFORE_START"
    if normalized_end > normalized_start + timedelta(days=max_period_days):
        return False, "END_TOO_FAR"
    return True, "OK"


def validate_league_end_update(ends_at: datetime, max_days_ahead: int = 365) -> tuple[bool, str]:
    now = datetime.now(UTC)
    normalized_end = _aware_utc(ends_at)
    if normalized_end.date() <= now.date():
        return False, "END_TOO_SOON"
    if normalized_end > now + timedelta(days=max_days_ahead):
        return False, "END_TOO_FAR"
    return True, "OK"


def validate_max_members(max_members: int, max_allowed: int = 100000) -> tuple[bool, str]:
    if max_members < 2:
        return False, "MAX_MEMBERS_TOO_LOW"
    if max_members > max_allowed:
        return False, "MAX_MEMBERS_TOO_HIGH"
    return True, "OK"


def _aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
