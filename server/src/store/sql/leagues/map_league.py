from datetime import datetime
from uuid import UUID

from src.app.crypto.ids import uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

def map_league(row) -> LeagueRow:
    return LeagueRow(
        league_id=row["league_id"],
        host_user_id=row["host_user_id"],
        host_username=row["host_username"],
        host_name=row["host_name"],
        name=row["name"],
        status=row["status"],
        starts_at=row["starts_at"],
        ends_at=row["ends_at"],
        include_existing_points=row["include_existing_points"],
        max_members=row["max_members"],
        scoring=LeagueScoringSettings(
            include_outcome_points=row["include_outcome_points"],
            include_btts_points=row["include_btts_points"],
            include_scorer_points=row["include_scorer_points"],
            include_hatrick_bonus=row["include_hatrick_bonus"],
            only_hatricks=row["only_hatricks"],
        ),
        winner_user_id=row["winner_user_id"],
        finished_at=row["finished_at"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        member_count=row["member_count"],
        is_host=row["is_host"],
        user_rank=row["user_rank"],
        user_points=row["user_points"],
    )
