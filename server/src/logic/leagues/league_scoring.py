from uuid import UUID

from server.src.store.sql.leagues.read_models import LeagueMemberScoreRow, LeaguePredictionScoreRow, LeagueScoredStanding, LeagueScoringSettings

OUTCOME_POINTS = 10
BTTS_POINTS = 10
SCORER_POINTS = 25
HATRICK_POINTS = 15


def score_league_standings(
    members: list[LeagueMemberScoreRow],
    predictions: list[LeaguePredictionScoreRow],
    scoring: LeagueScoringSettings,
) -> list[LeagueScoredStanding]:
    buckets = {
        member.user_id: {
            "user_id": member.user_id,
            "joined_at": member.joined_at,
            "points": 0,
            "predictions_count": 0,
            "correct_outcomes": 0,
            "correct_btts": 0,
            "correct_scorers": 0,
            "hatricks": 0,
        }
        for member in members
    }

    for prediction in predictions:
        bucket = buckets.get(prediction.user_id)
        if bucket is None:
            continue
        bucket["predictions_count"] += 1
        if prediction.outcome_correct:
            bucket["correct_outcomes"] += 1
        if prediction.btts_correct:
            bucket["correct_btts"] += 1
        if prediction.scorer_correct:
            bucket["correct_scorers"] += 1
        if prediction.hatrick_bonus_awarded:
            bucket["hatricks"] += 1

        bucket["points"] += league_prediction_points(prediction, scoring)

    ordered = sorted(
        buckets.values(),
        key=lambda item: (
            -int(item["points"]),
            -int(item["hatricks"]),
            -int(item["correct_scorers"]),
            -int(item["correct_outcomes"]),
            -int(item["correct_btts"]),
            item["joined_at"],
            str(item["user_id"]),
        ),
    )
    return [
        LeagueScoredStanding(
            user_id=item["user_id"],
            rank=index + 1,
            points=int(item["points"]),
            predictions_count=int(item["predictions_count"]),
            correct_outcomes=int(item["correct_outcomes"]),
            correct_btts=int(item["correct_btts"]),
            correct_scorers=int(item["correct_scorers"]),
            hatricks=int(item["hatricks"]),
        )
        for index, item in enumerate(ordered)
    ]


def league_prediction_points(prediction: LeaguePredictionScoreRow, scoring: LeagueScoringSettings) -> int:
    if scoring.only_hatricks:
        return HATRICK_POINTS if prediction.hatrick_bonus_awarded else 0

    total = 0
    if scoring.include_outcome_points and prediction.outcome_correct:
        total += OUTCOME_POINTS
    if scoring.include_btts_points and prediction.btts_correct:
        total += BTTS_POINTS
    if scoring.include_scorer_points and prediction.scorer_correct:
        total += SCORER_POINTS
    if scoring.include_hatrick_bonus and prediction.hatrick_bonus_awarded:
        total += HATRICK_POINTS
    return total


def winner_user_id(standings: list[LeagueScoredStanding]) -> UUID | None:
    return standings[0].user_id if standings else None
