from asyncpg import Record

from server.src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def map_match_player(row: Record) -> MatchPlayerRow:
    return MatchPlayerRow(
        player_id=row["player_id"],
        team_id=row["team_id"],
        name=row["name"],
        photo_url=row["photo_url"],
        position=row["position"],
        shirt_number=row["shirt_number"],
        source=row["source"],
    )
