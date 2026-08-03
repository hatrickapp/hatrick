from asyncpg import Record

from src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def map_match_goal(row: Record) -> MatchGoalRow:
    return MatchGoalRow(
        match_goal_id=row["match_goal_id"],
        match_id=row["match_id"],
        team_id=row["team_id"],
        player_id=row["player_id"],
        scorer_name=row["scorer_name"],
        shirt_number=row["shirt_number"],
        event_minute=row["event_minute"],
        event_extra=row["event_extra"],
        goal_type=row["goal_type"],
    )
