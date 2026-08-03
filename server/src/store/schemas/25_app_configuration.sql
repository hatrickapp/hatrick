CREATE TABLE app_plan_limits (
  plan TEXT PRIMARY KEY,
  active_league_limit INTEGER NOT NULL,
  can_customize_competitions BOOLEAN NOT NULL DEFAULT FALSE,
  can_customize_scoring BOOLEAN NOT NULL DEFAULT FALSE,
  can_count_existing_points BOOLEAN NOT NULL DEFAULT FALSE,
  can_change_username BOOLEAN NOT NULL DEFAULT FALSE,
  priority_support BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_app_plan_limits_plan CHECK (plan IN ('free', 'plus')),
  CONSTRAINT chk_app_plan_limits_active_league_limit CHECK (active_league_limit >= 0)
);

CREATE TABLE app_league_limits (
  config_key TEXT PRIMARY KEY DEFAULT 'default',
  default_max_members INTEGER NOT NULL,
  max_members INTEGER NOT NULL,
  max_period_days INTEGER NOT NULL,
  max_start_days_ahead INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_app_league_limits_key CHECK (config_key = 'default'),
  CONSTRAINT chk_app_league_limits_members CHECK (default_max_members BETWEEN 2 AND max_members),
  CONSTRAINT chk_app_league_limits_max_members CHECK (max_members BETWEEN 2 AND 100000),
  CONSTRAINT chk_app_league_limits_period_days CHECK (max_period_days BETWEEN 1 AND 365),
  CONSTRAINT chk_app_league_limits_start_days CHECK (max_start_days_ahead BETWEEN 0 AND 365)
);

CREATE TABLE app_plus_offering (
  config_key TEXT PRIMARY KEY DEFAULT 'plus',
  price_label TEXT NOT NULL,
  cta_label TEXT NOT NULL,
  features TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_app_plus_offering_key CHECK (config_key = 'plus'),
  CONSTRAINT chk_app_plus_offering_features CHECK (array_length(features, 1) >= 1)
);

CREATE TABLE app_league_scoring_presets (
  preset_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  include_outcome_points BOOLEAN NOT NULL,
  include_btts_points BOOLEAN NOT NULL,
  include_scorer_points BOOLEAN NOT NULL,
  include_hatrick_bonus BOOLEAN NOT NULL,
  only_hatricks BOOLEAN NOT NULL DEFAULT FALSE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_app_league_scoring_presets_rules CHECK (
    only_hatricks = TRUE
    OR include_outcome_points = TRUE
    OR include_btts_points = TRUE
    OR include_scorer_points = TRUE
    OR include_hatrick_bonus = TRUE
  )
);

CREATE UNIQUE INDEX idx_app_league_scoring_presets_one_default
ON app_league_scoring_presets (is_default)
WHERE is_default = TRUE AND is_active = TRUE;

INSERT INTO app_plan_limits (
  plan,
  active_league_limit,
  can_customize_competitions,
  can_customize_scoring,
  can_count_existing_points,
  can_change_username,
  priority_support
) VALUES
  ('free', 1, FALSE, FALSE, FALSE, FALSE, FALSE),
  ('plus', 20, TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (plan) DO UPDATE SET
  active_league_limit = EXCLUDED.active_league_limit,
  can_customize_competitions = EXCLUDED.can_customize_competitions,
  can_customize_scoring = EXCLUDED.can_customize_scoring,
  can_count_existing_points = EXCLUDED.can_count_existing_points,
  can_change_username = EXCLUDED.can_change_username,
  priority_support = EXCLUDED.priority_support,
  updated_at = NOW();

INSERT INTO app_league_limits (
  config_key,
  default_max_members,
  max_members,
  max_period_days,
  max_start_days_ahead
) VALUES (
  'default',
  20,
  100000,
  365,
  365
)
ON CONFLICT (config_key) DO UPDATE SET
  default_max_members = EXCLUDED.default_max_members,
  max_members = EXCLUDED.max_members,
  max_period_days = EXCLUDED.max_period_days,
  max_start_days_ahead = EXCLUDED.max_start_days_ahead,
  updated_at = NOW();

INSERT INTO app_plus_offering (
  config_key,
  price_label,
  cta_label,
  features
) VALUES (
  'plus',
  '$1.99/month',
  'Get Hatrick Plus',
  ARRAY[
    'Create up to 20 leagues',
    'Choose competitions',
    'Custom scoring',
    'Late join controls',
    'Plus Profile Badge',
    'Change your username',
    'Priority Support'
  ]
)
ON CONFLICT (config_key) DO UPDATE SET
  price_label = EXCLUDED.price_label,
  cta_label = EXCLUDED.cta_label,
  features = EXCLUDED.features,
  updated_at = NOW();

INSERT INTO app_league_scoring_presets (
  preset_key,
  label,
  description,
  include_outcome_points,
  include_btts_points,
  include_scorer_points,
  include_hatrick_bonus,
  only_hatricks,
  is_default,
  sort_order
) VALUES
  ('full', 'Full Hatrick', 'All the picks and bonus', TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, 10),
  ('winner', 'Winner', 'Only match result points', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 20),
  ('btts', 'BTTS', 'Only both teams to score', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 30),
  ('winner_btts', 'Winner + BTTS', 'Two fast prediction types', TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, 40),
  ('winner_scorer', 'Winner + Scorer', 'Result plus anytime scorer', TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, 50),
  ('hatricks', 'Hatricks Only', 'Only all three bonus points', FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 60)
ON CONFLICT (preset_key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  include_outcome_points = EXCLUDED.include_outcome_points,
  include_btts_points = EXCLUDED.include_btts_points,
  include_scorer_points = EXCLUDED.include_scorer_points,
  include_hatrick_bonus = EXCLUDED.include_hatrick_bonus,
  only_hatricks = EXCLUDED.only_hatricks,
  is_default = EXCLUDED.is_default,
  is_active = TRUE,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
