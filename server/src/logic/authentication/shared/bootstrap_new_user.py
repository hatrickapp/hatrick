from dataclasses import dataclass
from secrets import token_hex
from uuid import UUID

from asyncpg import Connection, UniqueViolationError

from src.logic.authentication.profile.update_profile_username import username_hash
from src.logic.authentication.shared.issue_session import IssuedSession, issue_session
from src.store.sql.authentication.users.insert_user import Provider, insert_user

@dataclass
class BootstrappedUser:
    user_id: UUID
    email: str
    session: IssuedSession


def generate_default_username() -> str:
    return f"hatrick_{token_hex(4)}"


async def bootstrap_new_user(
    conn: Connection,
    *,
    email: str,
    provider: Provider,
    country: str,
    name: str | None = None,
    oauth_subject: str | None = None,
) -> BootstrappedUser:
    user = None
    for _ in range(10):
        username = generate_default_username()
        try:
            user = await insert_user(
                conn,
                email,
                provider=provider,
                username=username,
                username_hash=username_hash(username),
                name=name,
                oauth_subject=oauth_subject,
            )
            break
        except UniqueViolationError:
            continue

    if user is None:
        raise RuntimeError("Could not generate a unique username.")

    session = await issue_session(conn, user.user_id, country)

    return BootstrappedUser(
        user_id=user.user_id,
        email=email,
        session=session,
    )
