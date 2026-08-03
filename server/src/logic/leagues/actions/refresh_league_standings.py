from datetime import UTC, datetime
from uuid import UUID

from server.src.logic.leagues.league_scoring import score_league_standings, winner_user_id
from server.src.store.sql.leagues.finish_league import finish_league
from server.src.store.sql.leagues.read_models import LeagueStandingRow
from server.src.store.sql.leagues.replace_league_standings import replace_league_standings
from server.src.store.sql.leagues.select_league_detail_for_scoring import select_league_detail_for_scoring
from server.src.store.sql.leagues.select_league_members_for_scoring import select_league_members_for_scoring
from server.src.store.sql.leagues.select_league_predictions_for_scoring import select_league_predictions_for_scoring

async def refresh_league_standings(conn, league_id: UUID) -> list[LeagueStandingRow] | None:
    league = await select_league_detail_for_scoring(conn, league_id)
    if league is None:
        return None
    members = await select_league_members_for_scoring(conn, league_id)
    predictions = await select_league_predictions_for_scoring(conn, league_id)

    standings = score_league_standings(members, predictions, league.scoring)
    await replace_league_standings(conn, league_id, standings)

    now = datetime.now(UTC)
    top_user_id = winner_user_id(standings)
    if now >= league.ends_at:
        await finish_league(conn, league_id, top_user_id)

    return None
