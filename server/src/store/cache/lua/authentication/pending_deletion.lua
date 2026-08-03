redis.call("SET", KEYS[1], ARGV[2], "EX", ARGV[1])
return 1
