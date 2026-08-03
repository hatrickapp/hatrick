CREATE TABLE match_sync_state (
  match_id UUID PRIMARY KEY REFERENCES matches(match_id) ON DELETE CASCADE,
  provider_fixture_id INTEGER NOT NULL,
  stage TEXT NOT NULL DEFAULT 'scheduled',
  next_sync_at TIMESTAMPTZ,
  syncing_at TIMESTAMPTZ,
  last_fixture_sync_at TIMESTAMPTZ,
  last_events_sync_at TIMESTAMPTZ,
  final_synced_at TIMESTAMPTZ,
  sync_stopped BOOLEAN NOT NULL DEFAULT FALSE,
  last_status TEXT,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_match_sync_state_stage CHECK (
    stage IN ('scheduled', 'pre_kickoff', 'live', 'delayed', 'final_confirm', 'settled', 'void', 'stopped')
  )
);

CREATE INDEX idx_match_sync_state_due
ON match_sync_state (next_sync_at, stage)
WHERE sync_stopped = FALSE AND next_sync_at IS NOT NULL;

CREATE INDEX idx_match_sync_state_syncing
ON match_sync_state (syncing_at)
WHERE syncing_at IS NOT NULL;
