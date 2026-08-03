from functools import lru_cache
import re

from fastapi import HTTPException
from user_agents import parse

class BotDetected(Exception):
    pass


ANDROID_EMULATOR_MODEL_MAP = {
    "gphone16k": "Pixel 8",
    "gphone64": "Pixel",
    "gphone": "Pixel",
}


def clean_device_token(value: str) -> str:
    return re.sub(r"[_-]+", " ", value).strip()


def readable_android_model(model: str) -> str:
    normalized = model.lower()
    for token, label in ANDROID_EMULATOR_MODEL_MAP.items():
        if token in normalized:
            return label
    if normalized.startswith("sdk "):
        return "Android Emulator"
    return clean_device_token(model)


@lru_cache(maxsize=2000)
def parse_and_extract(user_agent_string: str) -> str:
    if not user_agent_string:
        return "Unknown"

    ua = parse(user_agent_string)

    if ua.is_bot:
        raise BotDetected()

    # Device
    if ua.device.family and ua.device.family != "Other":
        device = ua.device.family
    elif ua.is_tablet:
        device = "Tablet"
    elif ua.is_mobile:
        device = "Mobile"
    elif ua.is_pc:
        device = "PC"
    else:
        device = "Unknown"

    # Brand and model for mobile/tablet
    brand = ua.device.brand or ""
    model = ua.device.model or ""
    if ua.os.family == "Android" and model:
        model = readable_android_model(model)
        normalized_brand = brand.lower().replace("_", "").replace("-", "").replace(" ", "")
        brand = "" if normalized_brand in {"generic", "genericandroid"} else brand
    else:
        model = clean_device_token(model)
        brand = clean_device_token(brand)

    device_full = f"{brand} {model}".strip() if brand or model else device

    # OS with version
    os_name = ua.os.family or "Unknown OS"
    os_version = ".".join(str(v) for v in ua.os.version if v)
    os_full = f"{os_name} {os_version}".strip() if os_version else os_name

    return f"{device_full} ({os_full})"


async def extract_device(user_agent_string: str) -> str:
    try:
        return parse_and_extract(user_agent_string)
    except BotDetected:
        raise HTTPException(status_code=403, detail="BOT_NOT_ALLOWED")
