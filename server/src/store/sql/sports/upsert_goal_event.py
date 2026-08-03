from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.sports.upsert_player import upsert_player

async def upsert_goal_event(conn: Connection, match_id: UUID, event: dict[str, Any]) -> None:
    if event.get("type") != "Goal":
        return
    detail = event.get("detail") or "Normal Goal"
    if detail == "Missed Penalty":
        return

    team_id = None
    team = event.get("team") or {}
    if team.get("id") is not None:
        team_id = await conn.fetchval("SELECT team_id FROM teams WHERE provider_team_id = $1", team.get("id"))

    player = event.get("player") or {}
    player_id = await upsert_player(conn, player)
    time_data = event.get("time") or {}
    if "Shootout" in detail:
        goal_type = "shootout"
    elif detail == "Penalty":
        goal_type = "penalty"
    elif detail == "Own Goal":
        goal_type = "own_goal"
    else:
        goal_type = "normal"
    event_key = f"{match_id}:{time_data.get('elapsed')}:{time_data.get('extra')}:{team.get('id')}:{player.get('id')}:{detail}"

    await conn.execute(
        """
        INSERT INTO match_goals (
            match_goal_id,
            match_id,
            team_id,
            player_id,
            provider_event_key,
            event_minute,
            event_extra,
            scorer_name,
            goal_type,
            counts_for_scorer
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (provider_event_key) DO NOTHING
        """,
        uuid7(),
        match_id,
        team_id,
        player_id,
        event_key,
        time_data.get("elapsed"),
        time_data.get("extra"),
        player.get("name") or "Unknown",
        goal_type,
        goal_type in {"normal", "penalty"},
    )
