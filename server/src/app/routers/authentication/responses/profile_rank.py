from src.app.routers.classes.authentication_classes import UserProfileRank

def profile_rank(
    rank_key: str | None,
    name: str | None,
    min_points: int | None,
    icon_key: str | None,
    color_hex: str | None,
) -> UserProfileRank | None:
    if rank_key is None or name is None or min_points is None or icon_key is None or color_hex is None:
        return None
    return UserProfileRank(
        rank_key=rank_key,
        name=name,
        min_points=min_points,
        icon_key=icon_key,
        color_hex=color_hex,
    )
