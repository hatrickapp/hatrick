MATCH_SELECT = """
SELECT
  m.match_id,
  m.kickoff_at,
  m.status,
  m.status_long,
  m.home_score,
  m.away_score,
  m.final_home_score,
  m.final_away_score,
  m.is_locked,
  m.is_settled,
  m.is_void,
  c.competition_id,
  c.name AS competition_name,
  c.country AS competition_country,
  c.type AS competition_type,
  c.logo_url AS competition_logo_url,
  c.sort_order AS competition_sort_order,
  ht.team_id AS home_team_id,
  ht.name AS home_team_name,
  ht.short_name AS home_team_short_name,
  ht.logo_url AS home_team_logo_url,
  at.team_id AS away_team_id,
  at.name AS away_team_name,
  at.short_name AS away_team_short_name,
  at.logo_url AS away_team_logo_url,
  p.prediction_id,
  p.outcome_pick,
  p.btts_pick,
  p.scorer_player_id,
  p.status AS prediction_status,
  p.points,
  p.outcome_correct,
  p.btts_correct,
  p.scorer_correct,
  p.hatrick_bonus_awarded,
  p.created_at AS prediction_created_at,
  p.updated_at AS prediction_updated_at
FROM matches m
JOIN competitions c ON c.competition_id = m.competition_id
JOIN teams ht ON ht.team_id = m.home_team_id
JOIN teams at ON at.team_id = m.away_team_id
LEFT JOIN predictions p
  ON p.match_id = m.match_id
 AND p.user_id = $1
"""
