from datetime import date, datetime, timezone
from uuid import UUID

from asyncpg import Pool

from server.src.app.errors.domains.sports_errors import MatchNotFoundError
from server.src.logic.predictions.date_window import local_date_window
from server.src.store.sql.sports.list_competitions import list_competitions
from server.src.store.sql.sports.list_match_goals import list_match_goals
from server.src.store.sql.sports.list_match_players import list_match_players
from server.src.store.sql.sports.list_matches import list_matches
from server.src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow
from server.src.store.sql.sports.select_match import select_match
from server.src.store.sql.sports.select_user_timezone import select_user_timezone

async def get_competitions(pool: Pool) -> list[CompetitionRow]:
    async with pool.acquire() as conn:
        return await list_competitions(conn)


async def get_matches_for_user(
    pool: Pool,
    user_id: UUID,
    competition_id: UUID | None,
    match_date: date | None = None,
) -> list[MatchRow]:
    async with pool.acquire() as conn:
        timezone_name = await select_user_timezone(conn, user_id)
        start_at, end_at = local_date_window(datetime.now(timezone.utc), timezone_name, match_date)
        return await list_matches(conn, user_id, start_at, end_at, competition_id)


async def get_match_detail_for_user(pool: Pool, user_id: UUID, match_id: UUID) -> tuple[MatchRow, list[MatchPlayerRow], list[MatchGoalRow]]:
    async with pool.acquire() as conn:
        match = await select_match(conn, user_id, match_id)
        if match is None:
            raise MatchNotFoundError()
        players = await list_match_players(conn, match_id)
        goals = await list_match_goals(conn, match_id)
        return match, players, goals
