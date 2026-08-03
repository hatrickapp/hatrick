from asyncpg import Record

from server.src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def map_competition(row: Record, prefix: str = "competition_") -> CompetitionRow:
    return CompetitionRow(
        competition_id=row[f"{prefix}id"],
        name=row[f"{prefix}name"],
        country=row[f"{prefix}country"],
        type=row[f"{prefix}type"],
        logo_url=row[f"{prefix}logo_url"],
        sort_order=row[f"{prefix}sort_order"],
    )
