CREATE TABLE team_roster_sync_state (
  roster_sync_id UUID PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  competition_season_id UUID NOT NULL REFERENCES competition_seasons(competition_season_id) ON DELETE CASCADE,
  provider_team_id INTEGER NOT NULL,
  next_match_kickoff_at TIMESTAMPTZ NOT NULL,
  latest_match_kickoff_at TIMESTAMPTZ NOT NULL,
  next_roster_sync_at TIMESTAMPTZ,
  syncing_at TIMESTAMPTZ,
  last_roster_sync_at TIMESTAMPTZ,
  roster_status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_team_roster_sync_state_status CHECK (roster_status IN ('pending', 'synced', 'failed', 'stopped'))
);

CREATE UNIQUE INDEX idx_team_roster_sync_state_unique
ON team_roster_sync_state (team_id, competition_season_id);

CREATE INDEX idx_team_roster_sync_state_due
ON team_roster_sync_state (next_roster_sync_at, next_match_kickoff_at)
WHERE next_roster_sync_at IS NOT NULL AND roster_status != 'stopped';

CREATE INDEX idx_team_roster_sync_state_syncing
ON team_roster_sync_state (syncing_at)
WHERE syncing_at IS NOT NULL;
