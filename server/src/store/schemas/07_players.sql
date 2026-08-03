CREATE TABLE players (
  player_id UUID PRIMARY KEY,
  provider_player_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  nationality TEXT,
  position TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_name
ON players (name);
