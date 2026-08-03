from asyncpg import Connection

async def select_default_league_scoring_preset(conn: Connection):
    query = """
    SELECT
      include_outcome_points,
      include_btts_points,
      include_scorer_points,
      include_hatrick_bonus,
      only_hatricks
    FROM app_league_scoring_presets
    WHERE is_active = TRUE
      AND is_default = TRUE
    LIMIT 1
    """
    return await conn.fetchrow(query)
