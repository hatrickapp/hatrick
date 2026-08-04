from datetime import datetime
from uuid import UUID

from asyncpg import Connection

from src.store.sql.sports.map_match import map_match
from src.store.sql.sports.match_select import MATCH_SELECT
from src.store.sql.sports.read_models import MatchPlayerRow, PredictionHistoryRow

async def list_prediction_history(
    conn: Connection,
    user_id: UUID,
    cursor: UUID | None,
    limit: int,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
) -> list[PredictionHistoryRow]:
    query = f"""
    SELECT
        base.*,
        sp.player_id AS selected_player_id,
        smpp.team_id AS selected_team_id,
        sp.name AS selected_player_name,
        sp.position AS selected_player_position,
        smpp.shirt_number AS selected_player_shirt_number,
        COALESCE(smpp.source, 'squad') AS selected_player_source
    FROM (
        {MATCH_SELECT}
        WHERE p.user_id = $1
          AND ($2::uuid IS NULL OR p.prediction_id < $2)
          AND ($4::timestamptz IS NULL OR m.kickoff_at >= $4)
          AND ($5::timestamptz IS NULL OR m.kickoff_at < $5)
    ) base
    JOIN players sp ON sp.player_id = base.scorer_player_id
    LEFT JOIN match_player_pool smpp ON smpp.match_id = base.match_id AND smpp.player_id = sp.player_id
    ORDER BY base.prediction_id DESC
    LIMIT $3
    """
    rows = await conn.fetch(query, user_id, cursor, limit, start_at, end_at)
    history: list[PredictionHistoryRow] = []
    for row in rows:
        match = map_match(row)
        if match.user_prediction is None:
            continue
        scorer = MatchPlayerRow(
            player_id=row["selected_player_id"],
            team_id=row["selected_team_id"],
            name=row["selected_player_name"],
            position=row["selected_player_position"],
            shirt_number=row["selected_player_shirt_number"],
            source=row["selected_player_source"],
        )
        history.append(PredictionHistoryRow(prediction=match.user_prediction, match=match, scorer=scorer))
    return history
