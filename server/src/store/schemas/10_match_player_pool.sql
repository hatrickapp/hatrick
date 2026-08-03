CREATE TABLE match_player_pool (
  match_player_pool_id UUID PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(match_id),
  team_id UUID NOT NULL REFERENCES teams(team_id),
  player_id UUID NOT NULL REFERENCES players(player_id),
  source TEXT NOT NULL DEFAULT 'squad',
  shirt_number INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_match_player_pool_source CHECK (source = 'squad')
);

CREATE UNIQUE INDEX idx_match_player_pool_unique
ON match_player_pool (match_id, player_id);

CREATE INDEX idx_match_player_pool_match_team
ON match_player_pool (match_id, team_id, source);
