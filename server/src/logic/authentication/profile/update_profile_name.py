import re
from uuid import UUID

from asyncpg import Pool

from src.app.errors.domains.authentication_errors import InvalidProfileNameError, ProfileNameUpdateNotAllowedError, UserNotFoundError
from src.store.sql.authentication.users.insert_name import insert_name
from src.store.sql.authentication.users.select_profile_mutation_state import select_profile_mutation_state
from src.store.sql.authentication.users.update_name import update_name

PROFILE_NAME_MAX_LENGTH = 128


def normalize_profile_name(name: str) -> str:
    cleaned = re.sub(r"\s+", " ", name.strip())
    if (
        len(cleaned) < 5
        or len(cleaned) > PROFILE_NAME_MAX_LENGTH
        or not re.fullmatch(r"[A-Za-z][A-Za-z .'-]*", cleaned)
        or not any(char.isalpha() for char in cleaned)
    ):
        raise InvalidProfileNameError()

    for part in cleaned.split(" "):
        letters_only = re.sub(r"[.'-]", "", part)

        if len(letters_only) < 2:
            raise InvalidProfileNameError()

        if not re.fullmatch(r"[A-Za-z]+(?:[.'-][A-Za-z]+)*", part):
            raise InvalidProfileNameError()

    return cleaned


async def update_profile_name_logic(pool: Pool, user_id: UUID, name: str) -> str:
    normalized_name = normalize_profile_name(name)

    async with pool.acquire() as conn:
        async with conn.transaction():
            state = await select_profile_mutation_state(conn, user_id)
            if state is None:
                raise UserNotFoundError()

            if state.name is None:
                inserted = await insert_name(conn, user_id, normalized_name)
                if inserted is None:
                    raise ProfileNameUpdateNotAllowedError()
                return inserted

            if state.provider not in {"google", "apple"}:
                raise ProfileNameUpdateNotAllowedError()

            updated = await update_name(conn, user_id, normalized_name)
            if updated is None:
                raise ProfileNameUpdateNotAllowedError()
            return updated
