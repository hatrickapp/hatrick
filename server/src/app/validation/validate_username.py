import re

USERNAME_RE = re.compile(r"^[a-z0-9_]{3,20}$", re.ASCII)

RESERVED_USERNAMES = {
    "admin",
    "administrator",
    "api",
    "auth",
    "hatrick",
    "hatrick_admin",
    "moderator",
    "root",
    "support",
    "system",
}

OFFENSIVE_WORDS = {
    "asshole",
    "bastard",
    "bitch",
    "cunt",
    "fuck",
    "fucker",
    "nazi",
    "nigger",
    "shit",
    "slut",
    "whore",
}


def normalize_username(username: str) -> str:
    return username.strip().lower()


def validate_username(username: str) -> tuple[bool, str]:
    if not username or not isinstance(username, str):
        return False, "INVALID_USERNAME"

    normalized = normalize_username(username)
    if normalized != username.strip():
        return False, "INVALID_CHARACTERS"
    if not USERNAME_RE.fullmatch(normalized):
        return False, "INVALID_FORMAT"
    if normalized in RESERVED_USERNAMES:
        return False, "RESERVED_USERNAME"
    if any(word in normalized for word in OFFENSIVE_WORDS):
        return False, "OFFENSIVE_USERNAME"

    return True, normalized
