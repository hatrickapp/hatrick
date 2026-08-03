from src.app.routers.classes.league_classes import LeagueStandingItem
from src.store.sql.leagues.read_models import LeagueStandingRow

def standing_item(row: LeagueStandingRow) -> LeagueStandingItem:
    return LeagueStandingItem(
        user_id=row.user_id,
        username=row.username,
        name=row.name,
        avatar_url=row.avatar_url,
        plan=row.plan,
        rank=row.rank,
        points=row.points,
        predictions_count=row.predictions_count,
        correct_outcomes=row.correct_outcomes,
        correct_btts=row.correct_btts,
        correct_scorers=row.correct_scorers,
        hatricks=row.hatricks,
        is_current_user=row.is_current_user,
    )
