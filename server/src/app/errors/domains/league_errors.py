from server.src.app.errors.base import AppError

class InvalidLeagueNameError(AppError):
    code = "INVALID_LEAGUE_NAME"
    status_code = 400
    message = "Enter a valid league name between 3 and 60 characters."

    def __init__(self, detail: str | None = None):
        messages = {
            "INVALID_LEAGUE_NAME": self.message,
            "OFFENSIVE_LEAGUE_NAME": "Choose a league name without offensive words.",
        }
        super().__init__(messages.get(detail, self.message))


class InvalidLeagueSettingsError(AppError):
    code = "INVALID_LEAGUE_SETTINGS"
    status_code = 400
    message = "Choose valid league settings."

    def __init__(self, detail: str | None = None):
        messages = {
            "NO_COMPETITIONS": "Choose at least one competition.",
            "TOO_MANY_COMPETITIONS": "Choose fewer competitions.",
            "DUPLICATE_COMPETITIONS": "Choose each competition once.",
            "START_IN_PAST": "The league start date cannot be in the past.",
            "START_TOO_FAR": "The league cannot start more than one year from now.",
            "END_BEFORE_START": "The league end date must be after the start date.",
            "END_TOO_SOON": "The league end date must be at least tomorrow.",
            "END_TOO_FAR": "The league cannot run more than one year from its start date.",
            "MAX_MEMBERS_TOO_LOW": "A league needs at least two players.",
            "MAX_MEMBERS_TOO_HIGH": "Choose a lower player limit.",
            "NO_SCORING_RULES": "Choose at least one scoring rule.",
            "APP_CONFIG_MISSING": "League configuration is missing. Apply the app configuration SQL first.",
        }
        super().__init__(messages.get(detail, self.message))


class LeagueLimitReachedError(AppError):
    code = "LEAGUE_LIMIT_REACHED"
    status_code = 403
    message = "Your plan has reached its active league creation limit."


class LeagueNotFoundError(AppError):
    code = "LEAGUE_NOT_FOUND"
    status_code = 404
    message = "This league could not be found."


class LeaguePermissionError(AppError):
    code = "LEAGUE_PERMISSION_DENIED"
    status_code = 403
    message = "You can only change leagues you host."


class LeagueMemberActionError(AppError):
    code = "LEAGUE_MEMBER_ACTION_DENIED"
    status_code = 409
    message = "This league member action is not available."

    def __init__(self, detail: str | None = None):
        messages = {
            "HOST_LEAVE": "The league host cannot leave their own league.",
            "REMOVE_SELF": "You cannot remove yourself from your own league.",
            "SELF_INVITE": "You cannot invite yourself to your own league.",
            "LAST_MEMBER": "A league must keep at least one active member.",
            "MEMBER_NOT_FOUND": "This league member could not be found.",
        }
        super().__init__(messages.get(detail, self.message))


class InvalidLeagueInviteError(AppError):
    code = "INVALID_LEAGUE_INVITE"
    status_code = 404
    message = "This invitation is no longer available."


class LeagueAlreadyJoinedError(AppError):
    code = "LEAGUE_ALREADY_JOINED"
    status_code = 409
    message = "You have already joined this league."


class LeagueFullError(AppError):
    code = "LEAGUE_FULL"
    status_code = 409
    message = "This league is full."


class LeagueClosedError(AppError):
    code = "LEAGUE_CLOSED"
    status_code = 409
    message = "The league you are trying to join is closed. Try again when the host reactivates it."


class LeagueFinishedError(AppError):
    code = "LEAGUE_FINISHED"
    status_code = 409
    message = "This league has finished."
