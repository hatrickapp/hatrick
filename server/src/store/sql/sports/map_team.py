from asyncpg import Record

from src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def map_team(row: Record, prefix: str) -> TeamRow:
    return TeamRow(
        team_id=row[f"{prefix}_team_id"],
        name=row[f"{prefix}_team_name"],
        short_name=row[f"{prefix}_team_short_name"],
        logo_url=row[f"{prefix}_team_logo_url"],
    )
