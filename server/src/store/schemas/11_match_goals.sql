CREATE TABLE match_goals (
  match_goal_id UUID PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(match_id),
  team_id UUID REFERENCES teams(team_id),
  player_id UUID REFERENCES players(player_id),
  provider_event_key TEXT UNIQUE NOT NULL,
  event_minute INTEGER,
  event_extra INTEGER,
  scorer_name TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  counts_for_scorer BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_match_goals_type CHECK (goal_type IN ('normal', 'penalty', 'own_goal', 'shootout'))
);

CREATE INDEX idx_match_goals_match
ON match_goals (match_id);
