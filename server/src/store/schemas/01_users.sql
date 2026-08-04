CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email_encrypted TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  name TEXT,
  username TEXT NOT NULL,
  username_hash TEXT NOT NULL,
  username_changed_at TIMESTAMPTZ,
  username_setup_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  -- Account Information
  account_status TEXT NOT NULL DEFAULT 'active',
  role TEXT NOT NULL DEFAULT 'consumer',
  plan TEXT NOT NULL DEFAULT 'free',
  provider TEXT NOT NULL DEFAULT 'google', CHECK (provider IN ('google', 'apple')),
  oauth_subject TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_users_role CHECK (role IN ('consumer', 'admin')),
  CONSTRAINT chk_users_plan CHECK (plan IN ('free', 'plus')),
  CONSTRAINT chk_users_timezone CHECK (char_length(timezone) BETWEEN 1 AND 64),
  CONSTRAINT chk_users_username_format CHECK (
    username ~ '^[a-z0-9_]{3,20}$'
  ),
  CONSTRAINT chk_users_username_hash CHECK (
    char_length(username_hash) BETWEEN 32 AND 128
  ),
  CONSTRAINT chk_users_name_format CHECK (
    name IS NULL
    OR (
      char_length(name) BETWEEN 5 AND 128
      AND name ~ '^[A-Za-z]([.''-]?[A-Za-z])+( [A-Za-z]([.''-]?[A-Za-z])+)*$'
    )
  )
);

-- Unique index for active users email (Excludes normal deleted, Includes Banned)
CREATE UNIQUE INDEX idx_users_email_active_user 
ON users (email_hash) 
WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX idx_users_username_hash_active_user
ON users (username_hash)
WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX idx_users_username_lower_active_user
ON users (lower(username))
WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX idx_users_provider_subject_active_user
ON users (provider, oauth_subject)
WHERE is_deleted = FALSE AND oauth_subject IS NOT NULL;

CREATE INDEX idx_users_username_search_active_user
ON users (lower(username), user_id)
WHERE is_deleted = FALSE AND username_setup_completed = TRUE;

CREATE UNIQUE INDEX idx_users_single_admin
ON users (role)
WHERE role = 'admin';
