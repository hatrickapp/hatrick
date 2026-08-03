from datetime import datetime
from uuid import UUID, uuid7

from asyncpg import Connection

from src.store.sql.leagues.read_models import LeagueInvitationRow, LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueRow, LeagueScoredStanding, LeagueScoringSettings, LeagueStandingRow
from src.store.sql.sports.read_models import CompetitionRow

def map_invitation(row, competitions: list[CompetitionRow]) -> LeagueInvitationRow:
    league = LeagueRow(
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
        created_at=row["league_created_at"],
        updated_at=row["league_updated_at"],
        member_count=row["member_count"],
        is_host=False,
        user_rank=None,
        user_points=None,
        competitions=competitions,
    )
    return LeagueInvitationRow(
        league_invitation_id=row["league_invitation_id"],
        league=league,
        invited_by_user_id=row["invited_by_user_id"],
        invited_by_username=row["invited_by_username"],
        invited_by_name=row["invited_by_name"],
        invited_by_avatar_url=row["invited_by_avatar_url"],
        invited_by_plan=row["invited_by_plan"],
        status=row["invitation_status"],
        created_at=row["invitation_created_at"],
        responded_at=row["responded_at"],
        expires_at=row["expires_at"],
    )
