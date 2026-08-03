from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid7

from asyncpg import Connection

from server.src.store.sql.sports.parse_provider_datetime import parse_provider_datetime
from server.src.store.sql.sports.upsert_competition_season import upsert_competition_season
from server.src.store.sql.sports.upsert_team import upsert_team

async def upsert_match_fixture(conn: Connection, fixture_payload: dict[str, Any]) -> UUID | None:
    league = fixture_payload.get("league") or {}
    fixture = fixture_payload.get("fixture") or {}
    teams = fixture_payload.get("teams") or {}
    goals = fixture_payload.get("goals") or {}
    score = fixture_payload.get("score") or {}
    fulltime_score = score.get("fulltime") or {}
    status = fixture.get("status") or {}

    provider_league_id = league.get("id")
    provider_fixture_id = fixture.get("id")
    if provider_league_id is None or provider_fixture_id is None:
        return None

    competition = await conn.fetchrow(
        """
        UPDATE competitions
        SET logo_url = COALESCE($2, logo_url),
            updated_at = NOW()
        WHERE provider_league_id = $1
          AND is_enabled = TRUE
        RETURNING competition_id
        """,
        provider_league_id,
        league.get("logo"),
    )
    if competition is None:
        return None

    season_year = int(league.get("season") or datetime.now(timezone.utc).year)
    competition_season_id = await upsert_competition_season(conn, competition["competition_id"], season_year)
    home_team_id = await upsert_team(conn, teams.get("home") or {})
    away_team_id = await upsert_team(conn, teams.get("away") or {})
    kickoff_at = parse_provider_datetime(fixture["date"])
    if home_team_id is None or away_team_id is None:
        return None

    short_status = status.get("short") or "NS"
    is_void = short_status in {"PST", "CANC", "ABD", "AWD", "WO"}
    fulltime_home_score = fulltime_score.get("home")
    fulltime_away_score = fulltime_score.get("away")
    current_home_score = goals.get("home")
    current_away_score = goals.get("away")
    prediction_home_score = fulltime_home_score if short_status in {"AET", "PEN"} and fulltime_home_score is not None else current_home_score
    prediction_away_score = fulltime_away_score if short_status in {"AET", "PEN"} and fulltime_away_score is not None else current_away_score
    final_home_score = current_home_score if short_status in {"FT", "AET", "PEN"} else None
    final_away_score = current_away_score if short_status in {"FT", "AET", "PEN"} else None
    row = await conn.fetchrow(
        """
        INSERT INTO matches (
            match_id,
            provider_fixture_id,
            competition_id,
            competition_season_id,
            home_team_id,
            away_team_id,
            kickoff_at,
            status,
            status_long,
            elapsed,
            home_score,
            away_score,
            final_home_score,
            final_away_score,
            is_locked,
            is_void,
            provider_updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW() >= ($7::timestamptz - INTERVAL '5 minutes'), $15, NOW())
        ON CONFLICT (provider_fixture_id) DO UPDATE
        SET competition_id = EXCLUDED.competition_id,
            competition_season_id = EXCLUDED.competition_season_id,
            home_team_id = EXCLUDED.home_team_id,
            away_team_id = EXCLUDED.away_team_id,
            kickoff_at = EXCLUDED.kickoff_at,
            status = EXCLUDED.status,
            status_long = EXCLUDED.status_long,
            elapsed = EXCLUDED.elapsed,
            home_score = EXCLUDED.home_score,
            away_score = EXCLUDED.away_score,
            final_home_score = EXCLUDED.final_home_score,
            final_away_score = EXCLUDED.final_away_score,
            is_locked = matches.is_locked OR EXCLUDED.is_locked OR EXCLUDED.status NOT IN ('NS', 'TBD'),
            is_void = EXCLUDED.is_void,
            provider_updated_at = NOW(),
            updated_at = NOW()
        RETURNING match_id
        """,
        uuid7(),
        provider_fixture_id,
        competition["competition_id"],
        competition_season_id,
        home_team_id,
        away_team_id,
        kickoff_at,
        short_status,
        status.get("long"),
        status.get("elapsed"),
        prediction_home_score,
        prediction_away_score,
        final_home_score,
        final_away_score,
        is_void,
    )
    return row["match_id"]
