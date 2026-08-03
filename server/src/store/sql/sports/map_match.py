from asyncpg import Record

from server.src.store.sql.sports.map_competition import map_competition
from server.src.store.sql.sports.map_prediction import map_prediction
from server.src.store.sql.sports.map_team import map_team
from server.src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def map_match(row: Record) -> MatchRow:
    return MatchRow(
        match_id=row["match_id"],
        kickoff_at=row["kickoff_at"],
        status=row["status"],
        status_long=row["status_long"],
        home_score=row["home_score"],
        away_score=row["away_score"],
        final_home_score=row["final_home_score"],
        final_away_score=row["final_away_score"],
        is_locked=row["is_locked"],
        is_settled=row["is_settled"],
        is_void=row["is_void"],
        competition=map_competition(row),
        home_team=map_team(row, "home"),
        away_team=map_team(row, "away"),
        user_prediction=map_prediction(row),
    )
