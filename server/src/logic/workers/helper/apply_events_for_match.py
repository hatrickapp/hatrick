from typing import Any

from server.src.store.sql.sports.upsert_goal_event import upsert_goal_event

async def apply_events_for_match(conn, match_id, events: list[dict[str, Any]]) -> None:
    for event in events:
        await upsert_goal_event(conn, match_id, event)
