local session_key = KEYS[1]
local user_key = KEYS[2]
local session_token_hash = ARGV[1]
local session_id = ARGV[2]
local user_id = ARGV[3]
local expires_at = ARGV[4]
local account_status = ARGV[5]
local role = ARGV[6]
local ttl = tonumber(ARGV[7])

redis.call("HSET", session_key,
    "session_id", session_id,
    "user_id", user_id,
    "expires_at", expires_at,
    "account_status", account_status,
    "role", role
)
redis.call("EXPIRE", session_key, ttl)

redis.call("SADD", user_key, session_token_hash)

return 1
