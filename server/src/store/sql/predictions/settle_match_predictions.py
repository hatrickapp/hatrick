from uuid import UUID

from asyncpg import Connection

from server.src.logic.predictions.scoring import score_prediction

async def settle_match_predictions(conn: Connection, match_id: UUID) -> int:
    match_query = """
    SELECT home_score, away_score, is_void
    FROM matches
    WHERE match_id = $1
      AND home_score IS NOT NULL
      AND away_score IS NOT NULL
    """
    match = await conn.fetchrow(match_query, match_id)
    if match is None:
        return 0

    if match["is_void"]:
        await conn.execute(
            """
            UPDATE predictions
            SET status = 'void',
                points = 0,
                settled_at = NOW(),
                updated_at = NOW()
            WHERE match_id = $1
              AND status != 'void'
            """,
            match_id,
        )
        return 0

    scorer_rows = await conn.fetch(
        """
        SELECT player_id
        FROM match_goals
        WHERE match_id = $1
          AND counts_for_scorer = TRUE
          AND player_id IS NOT NULL
          AND (event_minute IS NULL OR event_minute <= 90)
        """,
        match_id,
    )
    scorer_ids = {str(row["player_id"]) for row in scorer_rows}

    rows = await conn.fetch(
        """
        SELECT prediction_id, user_id, outcome_pick, btts_pick, scorer_player_id
        FROM predictions
        WHERE match_id = $1
          AND status != 'settled'
          AND status != 'void'
        """,
        match_id,
    )

    settled = 0
    for row in rows:
        score = score_prediction(
            outcome_pick=row["outcome_pick"],
            btts_pick=row["btts_pick"],
            scorer_player_id=str(row["scorer_player_id"]),
            home_score=match["home_score"],
            away_score=match["away_score"],
            scorer_player_ids=scorer_ids,
        )
        await conn.execute(
            """
            UPDATE predictions
            SET status = 'settled',
                outcome_correct = $2,
                btts_correct = $3,
                scorer_correct = $4,
                hatrick_bonus_awarded = $5,
                points = $6,
                settled_at = NOW(),
                updated_at = NOW()
            WHERE prediction_id = $1
            """,
            row["prediction_id"],
            score.outcome_correct,
            score.btts_correct,
            score.scorer_correct,
            score.hatrick_bonus_awarded,
            score.points,
        )
        settled += 1

    await conn.execute(
        """
        UPDATE matches
        SET is_settled = TRUE,
            settled_at = NOW(),
            updated_at = NOW()
        WHERE match_id = $1
        """,
        match_id,
    )
    return settled
