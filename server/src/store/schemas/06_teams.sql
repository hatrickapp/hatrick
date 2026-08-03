CREATE TABLE teams (
  team_id UUID PRIMARY KEY,
  provider_team_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  country TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_name
ON teams (name);
