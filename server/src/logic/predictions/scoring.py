from dataclasses import dataclass

@dataclass(frozen=True)
class PredictionScore:
    outcome_correct: bool
    btts_correct: bool
    scorer_correct: bool
    hatrick_bonus_awarded: bool
    points: int


def resolve_outcome(home_score: int, away_score: int) -> str:
    if home_score > away_score:
        return "home"
    if away_score > home_score:
        return "away"
    return "draw"


def resolve_btts(home_score: int, away_score: int) -> bool:
    return home_score >= 1 and away_score >= 1


def score_prediction(
    outcome_pick: str,
    btts_pick: bool,
    scorer_player_id: str,
    home_score: int,
    away_score: int,
    scorer_player_ids: set[str],
) -> PredictionScore:
    outcome_correct = outcome_pick == resolve_outcome(home_score, away_score)
    btts_correct = btts_pick == resolve_btts(home_score, away_score)
    scorer_correct = scorer_player_id in scorer_player_ids
    hatrick_bonus_awarded = outcome_correct and btts_correct and scorer_correct

    points = 0
    if outcome_correct:
        points += 10
    if btts_correct:
        points += 10
    if scorer_correct:
        points += 25
    if hatrick_bonus_awarded:
        points += 15

    return PredictionScore(
        outcome_correct=outcome_correct,
        btts_correct=btts_correct,
        scorer_correct=scorer_correct,
        hatrick_bonus_awarded=hatrick_bonus_awarded,
        points=points,
    )
