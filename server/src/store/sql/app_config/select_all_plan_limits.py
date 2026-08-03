from asyncpg import Connection

async def select_all_plan_limits(conn: Connection):
    query = """
    SELECT
      plan,
      active_league_limit,
      can_customize_competitions,
      can_customize_scoring,
      can_count_existing_points,
      can_change_username,
      priority_support
    FROM app_plan_limits
    ORDER BY CASE plan WHEN 'free' THEN 1 WHEN 'plus' THEN 2 ELSE 3 END
    """
    return await conn.fetch(query)
