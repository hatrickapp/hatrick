from datetime import date
from typing import Any

import httpx
import orjson

from server.src.app.config.settings import settings
from server.src.app.logging.logger_setup import get_logger

logger = get_logger(__name__)
API_FOOTBALL_REQUEST_TOTAL = 0


class ApiFootballError(Exception):
    pass


class ApiFootballClient:
    def __init__(self, http: httpx.AsyncClient):
        self.http = http
        self.base_url = settings.api_football.base_url
        self.api_key = settings.api_football.api_key

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    async def get(self, path: str, params: dict[str, Any]) -> list[dict[str, Any]]:
        global API_FOOTBALL_REQUEST_TOTAL
        if not self.enabled:
            return []
        API_FOOTBALL_REQUEST_TOTAL += 1
        request_number = API_FOOTBALL_REQUEST_TOTAL
        response = await self.http.get(
            f"{self.base_url}{path}",
            params=params,
            headers={"x-apisports-key": self.api_key},
        )
        logger.info(
            "api_football_request",
            extra={
                "path": path,
                "params": orjson.dumps(params).decode(),
                "status_code": response.status_code,
                "request_total": request_number,
            },
        )
        response.raise_for_status()
        payload = response.json()
        errors = payload.get("errors")
        if errors:
            raise ApiFootballError(str(errors))
        result = payload.get("response", [])
        return result if isinstance(result, list) else []

    async def fixtures_by_date(self, match_date: date) -> list[dict[str, Any]]:
        return await self.get("/fixtures", {"date": match_date.isoformat()})

    async def live_fixtures(self) -> list[dict[str, Any]]:
        return await self.get("/fixtures", {"live": "all"})

    async def fixture(self, fixture_id: int) -> list[dict[str, Any]]:
        return await self.get("/fixtures", {"id": fixture_id})

    async def events(self, fixture_id: int) -> list[dict[str, Any]]:
        return await self.get("/fixtures/events", {"fixture": fixture_id})

    async def squad(self, team_id: int) -> list[dict[str, Any]]:
        return await self.get("/players/squads", {"team": team_id})
