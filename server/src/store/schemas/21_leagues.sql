CREATE TABLE leagues (
  league_id UUID PRIMARY KEY,
  host_user_id UUID NOT NULL REFERENCES users(user_id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  include_existing_points BOOLEAN NOT NULL DEFAULT FALSE,
  max_members INTEGER NOT NULL,
  include_outcome_points BOOLEAN NOT NULL DEFAULT TRUE,
  include_btts_points BOOLEAN NOT NULL DEFAULT TRUE,
  include_scorer_points BOOLEAN NOT NULL DEFAULT TRUE,
  include_hatrick_bonus BOOLEAN NOT NULL DEFAULT TRUE,
  only_hatricks BOOLEAN NOT NULL DEFAULT FALSE,
  winner_user_id UUID REFERENCES users(user_id),
  finished_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_leagues_name_length CHECK (char_length(trim(name)) BETWEEN 3 AND 60),
  CONSTRAINT chk_leagues_status CHECK (status IN ('active', 'paused', 'closed', 'finished', 'deleted')),
  CONSTRAINT chk_leagues_period CHECK (starts_at < ends_at),
  CONSTRAINT chk_leagues_max_members CHECK (max_members BETWEEN 2 AND 100000),
  CONSTRAINT chk_leagues_scoring CHECK (
    only_hatricks = TRUE
    OR include_outcome_points = TRUE
    OR include_btts_points = TRUE
    OR include_scorer_points = TRUE
    OR include_hatrick_bonus = TRUE
  ),
  CONSTRAINT chk_leagues_finished_state CHECK (
    (status = 'finished' AND finished_at IS NOT NULL)
    OR status != 'finished'
  ),
  CONSTRAINT chk_leagues_deleted_state CHECK (
    (status = 'deleted' AND deleted_at IS NOT NULL)
    OR status != 'deleted'
  )
);

CREATE INDEX idx_leagues_host_active
ON leagues (host_user_id, status, ends_at)
WHERE status IN ('active', 'paused', 'closed');

CREATE INDEX idx_leagues_status_ends
ON leagues (status, ends_at);

CREATE OR REPLACE FUNCTION prevent_finished_league_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'finished' THEN
    RAISE EXCEPTION 'finished leagues cannot be deleted';
  END IF;
  IF OLD.status = 'finished' AND (NEW.status = 'deleted' OR NEW.deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'finished leagues cannot be deleted';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_finished_league_delete
BEFORE UPDATE OR DELETE ON leagues
FOR EACH ROW
EXECUTE FUNCTION prevent_finished_league_delete();
