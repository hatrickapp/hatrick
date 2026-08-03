from asyncpg import Connection

async def select_league_scoring_presets(conn: Connection):
    query = """
    SELECT
      preset_key,
      label,
      description,
      include_outcome_points,
      include_btts_points,
      include_scorer_points,
      include_hatrick_bonus,
      only_hatricks,
      is_default
    FROM app_league_scoring_presets
    WHERE is_active = TRUE
    ORDER BY sort_order
    """
    return await conn.fetch(query)
