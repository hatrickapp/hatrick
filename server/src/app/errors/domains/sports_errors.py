from src.app.errors.base import AppError

class MatchNotFoundError(AppError):
    code = "MATCH_NOT_FOUND"
    status_code = 404
    message = "This match could not be found."


class PredictionLockedError(AppError):
    code = "PREDICTION_LOCKED"
    status_code = 409
    message = "Predictions for this match are locked."


class InvalidPredictionPlayerError(AppError):
    code = "INVALID_PREDICTION_PLAYER"
    status_code = 400
    message = "Choose an available player for this match."


class MatchNotSettledError(AppError):
    code = "MATCH_NOT_SETTLED"
    status_code = 409
    message = "This match is not ready to settle."
