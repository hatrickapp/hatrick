CREATE TABLE username_reservations (
  username_reservation_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  username_hash TEXT NOT NULL,
  reserved_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_username_reservations_username_format CHECK (
    username ~ '^[a-z0-9_]{3,20}$'
  ),
  CONSTRAINT chk_username_reservations_hash CHECK (
    char_length(username_hash) BETWEEN 32 AND 128
  )
);

CREATE INDEX idx_username_reservations_hash_until
ON username_reservations (username_hash, reserved_until);

CREATE INDEX idx_username_reservations_lower_until
ON username_reservations (lower(username), reserved_until);
