local user_key = KEYS[1]
local session_token_hashes = redis.call("SMEMBERS", user_key)

for _, session_token_hash in ipairs(session_token_hashes) do
    local session_key = "session:" .. session_token_hash
    redis.call("DEL", session_key)
end

redis.call("DEL", user_key)

return 1
