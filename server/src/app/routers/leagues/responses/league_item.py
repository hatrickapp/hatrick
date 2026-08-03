from server.src.app.routers.classes.league_classes import LeagueScoringItem, LeagueSummaryItem
from server.src.app.routers.classes.sports_classes import CompetitionItem
from server.src.store.sql.leagues.read_models import LeagueRow

def league_item(league: LeagueRow) -> LeagueSummaryItem:
    return LeagueSummaryItem(
        league_id=league.league_id,
        host_user_id=league.host_user_id,
        host_username=league.host_username,
        host_name=league.host_name,
        name=league.name,
        status=league.status,
        starts_at=league.starts_at,
        ends_at=league.ends_at,
        include_existing_points=league.include_existing_points,
        max_members=league.max_members,
        member_count=league.member_count,
        scoring=LeagueScoringItem(
            include_outcome_points=league.scoring.include_outcome_points,
            include_btts_points=league.scoring.include_btts_points,
            include_scorer_points=league.scoring.include_scorer_points,
            include_hatrick_bonus=league.scoring.include_hatrick_bonus,
            only_hatricks=league.scoring.only_hatricks,
        ),
        winner_user_id=league.winner_user_id,
        finished_at=league.finished_at,
        is_host=league.is_host,
        user_rank=league.user_rank,
        user_points=league.user_points,
        competitions=[
            CompetitionItem(
                competition_id=competition.competition_id,
                name=competition.name,
                country=competition.country,
                type=competition.type,
                logo_url=competition.logo_url,
                sort_order=competition.sort_order,
            )
            for competition in (league.competitions or [])
        ],
    )
