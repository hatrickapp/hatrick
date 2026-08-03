import time
from secrets import randbits
from uuid import UUID


def uuid7() -> UUID:
    unix_ts_ms = int(time.time() * 1000) & ((1 << 48) - 1)
    rand_a = randbits(12)
    rand_b = randbits(62)

    value = unix_ts_ms << 80
    value |= 0x7 << 76
    value |= rand_a << 64
    value |= 0b10 << 62
    value |= rand_b

    return UUID(int=value)
