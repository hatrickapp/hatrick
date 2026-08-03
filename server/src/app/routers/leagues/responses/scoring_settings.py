from server.src.app.routers.classes.league_classes import LeagueScoringItem
from server.src.store.sql.leagues.read_models import LeagueScoringSettings

def scoring_settings(scoring: LeagueScoringItem) -> LeagueScoringSettings:
    return LeagueScoringSettings(
        include_outcome_points=scoring.include_outcome_points,
        include_btts_points=scoring.include_btts_points,
        include_scorer_points=scoring.include_scorer_points,
        include_hatrick_bonus=scoring.include_hatrick_bonus,
        only_hatricks=scoring.only_hatricks,
    )
