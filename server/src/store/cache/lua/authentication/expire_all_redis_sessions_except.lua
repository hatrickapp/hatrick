local user_key = KEYS[1]
local excluded_session_token_hash = ARGV[1]

local session_token_hashes = redis.call("SMEMBERS", user_key)
local to_remove = {}

for _, session_token_hash in ipairs(session_token_hashes) do
    if session_token_hash ~= excluded_session_token_hash then
        local session_key = "session:" .. session_token_hash
        redis.call("DEL", session_key)

        table.insert(to_remove, session_token_hash)
    end
end

if #to_remove > 0 then
    redis.call("SREM", user_key, unpack(to_remove))
end

return 1
