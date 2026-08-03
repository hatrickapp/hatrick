from server.src.app.routers.classes.sports_classes import CompetitionItem, MatchDetailResponse, MatchGoalItem, MatchListItem, MatchPredictionItem, PlayerItem, TeamItem
from server.src.store.sql.sports.read_models import CompetitionRow, MatchGoalRow, MatchPlayerRow, MatchRow, PredictionRow, TeamRow

def competition_item(row: CompetitionRow) -> CompetitionItem:
    return CompetitionItem(
        competition_id=row.competition_id,
        name=row.name,
        country=row.country,
        type=row.type,
        logo_url=row.logo_url,
        sort_order=row.sort_order,
    )


def team_item(row: TeamRow) -> TeamItem:
    return TeamItem(
        team_id=row.team_id,
        name=row.name,
        short_name=row.short_name,
        logo_url=row.logo_url,
    )


def prediction_item(row: PredictionRow) -> MatchPredictionItem:
    return MatchPredictionItem(
        prediction_id=row.prediction_id,
        outcome_pick=row.outcome_pick,
        btts_pick=row.btts_pick,
        scorer_player_id=row.scorer_player_id,
        status=row.status,
        points=row.points,
        outcome_correct=row.outcome_correct,
        btts_correct=row.btts_correct,
        scorer_correct=row.scorer_correct,
        hatrick_bonus_awarded=row.hatrick_bonus_awarded,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def match_item(row: MatchRow) -> MatchListItem:
    return MatchListItem(
        match_id=row.match_id,
        kickoff_at=row.kickoff_at,
        status=row.status,
        status_long=row.status_long,
        home_score=row.home_score,
        away_score=row.away_score,
        final_home_score=row.final_home_score,
        final_away_score=row.final_away_score,
        is_locked=row.is_locked,
        is_settled=row.is_settled,
        is_void=row.is_void,
        competition=competition_item(row.competition),
        home_team=team_item(row.home_team),
        away_team=team_item(row.away_team),
        user_prediction=prediction_item(row.user_prediction) if row.user_prediction else None,
    )


def player_item(row: MatchPlayerRow) -> PlayerItem:
    return PlayerItem(
        player_id=row.player_id,
        team_id=row.team_id,
        name=row.name,
        photo_url=row.photo_url,
        position=row.position,
        shirt_number=row.shirt_number,
        source=row.source,
    )


def goal_item(row: MatchGoalRow) -> MatchGoalItem:
    return MatchGoalItem(
        match_goal_id=row.match_goal_id,
        match_id=row.match_id,
        team_id=row.team_id,
        player_id=row.player_id,
        scorer_name=row.scorer_name,
        shirt_number=row.shirt_number,
        event_minute=row.event_minute,
        event_extra=row.event_extra,
        goal_type=row.goal_type,
    )


def match_detail_response(match: MatchRow, players: list[MatchPlayerRow], goals: list[MatchGoalRow]) -> MatchDetailResponse:
    return MatchDetailResponse(
        match=match_item(match),
        players=[player_item(player) for player in players],
        goals=[goal_item(goal) for goal in goals],
    )
