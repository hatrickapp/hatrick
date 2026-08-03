CREATE TABLE sports_sync_runs (
  sync_run_id UUID PRIMARY KEY,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT chk_sports_sync_runs_status CHECK (status IN ('running', 'success', 'failed'))
);

CREATE INDEX idx_sports_sync_runs_started
ON sports_sync_runs (started_at DESC);
