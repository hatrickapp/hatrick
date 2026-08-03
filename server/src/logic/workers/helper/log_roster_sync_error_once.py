from server.src.app.logging.logger_setup import get_logger
from server.src.logic.sports.api_football_client import ApiFootballError
from server.src.logic.workers.helper.sports_sync_schedule import is_rate_limit_error

logger = get_logger(__name__)

LOGGED_ROSTER_SYNC_ERRORS: set[tuple[int, str]] = set()

def log_roster_sync_error_once(provider_team_id: int, exc: ApiFootballError) -> None:
    error = str(exc)
    if is_rate_limit_error(exc):
        logger.debug("sports_team_roster_sync_rate_limited", extra={"provider_team_id": provider_team_id})
        return

    key = (provider_team_id, error)
    if key in LOGGED_ROSTER_SYNC_ERRORS:
        return

    LOGGED_ROSTER_SYNC_ERRORS.add(key)
    logger.warning("sports_team_roster_sync_skipped", extra={"provider_team_id": provider_team_id, "error": error})
