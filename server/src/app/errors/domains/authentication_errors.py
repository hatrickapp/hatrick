from src.app.errors.base import AppError

# -- Shared --

class OtpVerificationError(AppError):
    code = "INVALID_OTP"
    status_code = 400
    message = "The verification code is invalid or expired."

# -- Deletion --

class PendingUserDeletionNotFoundError(AppError):
    code = "PENDING_USER_DELETION_NOT_FOUND"
    status_code = 404
    message = "This deletion session has expired. Please start again."

class UserNotFoundError(AppError):
    code = "USER_NOT_FOUND"
    status_code = 404
    message = "Account not found."

# -- OAuth --

class OAuthStateMismatchError(AppError):
    code = "OAUTH_STATE_MISMATCH"
    status_code = 400
    message = "This sign-in session expired. Please try again."

class OAuthProviderError(AppError):
    code = "OAUTH_PROVIDER_ERROR"
    status_code = 502
    message = "We could not reach the sign-in provider. Please try again."

class OAuthEmailNotVerifiedError(AppError):
    code = "OAUTH_EMAIL_NOT_VERIFIED"
    status_code = 400
    message = "The email on this account is not verified. Please verify it with the provider first."

# -- Profile --

class InvalidProfileNameError(AppError):
    code = "INVALID_PROFILE_NAME"
    status_code = 400
    message = "Enter a valid full name with at least two name parts."

class InvalidUsernameError(AppError):
    code = "INVALID_USERNAME"
    status_code = 400
    message = "Usernames must be 3 to 20 characters and can only use letters, numbers, and underscores."

    def __init__(self, detail: str = None):
        messages = {
            "INVALID_USERNAME": self.message,
            "INVALID_CHARACTERS": "Usernames must be lowercase letters, numbers, and underscores only.",
            "INVALID_FORMAT": self.message,
            "RESERVED_USERNAME": "This username is reserved. Choose another username.",
            "OFFENSIVE_USERNAME": "Choose a username without offensive words.",
        }
        super().__init__(messages.get(detail, self.message))

class UsernameUnavailableError(AppError):
    code = "USERNAME_UNAVAILABLE"
    status_code = 409
    message = "This username is not available."

class UsernameChangeTooSoonError(AppError):
    code = "USERNAME_CHANGE_TOO_SOON"
    status_code = 429
    message = "You can change your username once every 30 days."

class UsernameChangeRequiresPlusError(AppError):
    code = "USERNAME_CHANGE_REQUIRES_PLUS"
    status_code = 403
    message = "Username changes are available with Hatrick Plus."

class ProfileNameUpdateNotAllowedError(AppError):
    code = "PROFILE_NAME_UPDATE_NOT_ALLOWED"
    status_code = 403
    message = "This account name is managed by your sign-in provider."

class InvalidTimezoneError(AppError):
    code = "INVALID_TIMEZONE"
    status_code = 400
    message = "Choose a valid timezone."
