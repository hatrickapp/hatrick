CREATE TABLE team_players (
  team_player_id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(team_id),
  player_id UUID NOT NULL REFERENCES players(player_id),
  competition_season_id UUID NOT NULL REFERENCES competition_seasons(competition_season_id),
  shirt_number INTEGER,
  position TEXT,
  source TEXT NOT NULL DEFAULT 'squad',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_team_players_source CHECK (source = 'squad')
);

CREATE UNIQUE INDEX idx_team_players_unique
ON team_players (team_id, player_id, competition_season_id);

CREATE INDEX idx_team_players_team_active
ON team_players (team_id, is_active)
WHERE is_active = TRUE;
