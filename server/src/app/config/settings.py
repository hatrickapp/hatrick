import base64
from dataclasses import dataclass
from functools import cached_property
from pathlib import Path
from typing import Literal

from pydantic import ConfigDict
from pydantic_settings import BaseSettings

@dataclass
class AppConfig:
    name: str = "Hatrick"

@dataclass
class ResendConfig:
    api_key: str
    sender_email: str

@dataclass
class OTPConfig:
    expire_minutes: int
    mock_code: str = "000000"

@dataclass
class SessionConfig:
    expire_days: int
    cookie_secure: bool
    cookie_samesite: Literal["lax", "strict", "none"]

@dataclass
class GoogleConfig:
    client_id: str
    keys_url: str = "https://www.googleapis.com/oauth2/v3/certs"

@dataclass
class AppleConfig:
    ios_bundle_id: str
    keys_url: str = "https://appleid.apple.com/auth/keys"

@dataclass
class ApiFootballConfig:
    api_key: str
    base_url: str

@dataclass
class RevenueCatConfig:
    entitlement_id: str
    project_id: str
    secret_api_key: str
    webhook_authorization: str
    webhook_signing_secret: str
    webhook_signature_tolerance_seconds: int
    api_base_url: str = "https://api.revenuecat.com/v2"

class Settings(BaseSettings):
    model_config = ConfigDict(ignored_types=(cached_property,), env_file=Path(__file__).resolve().parents[3] / ".env")

    # --- Loaded from .env ---
    AES_MASTER_KEY_B64: str
    BLAKE2S_HASHING_KEY_B64: str

    PSQL_URL: str
    REDIS_URL: str

    RESEND_API_KEY: str
    RESEND_SENDER_EMAIL: str

    API_FOOTBALL_KEY: str = ""
    API_FOOTBALL_BASE_URL: str = "https://v3.football.api-sports.io"
    SPORTS_SYNC_ENABLED: bool = False

    REVENUECAT_ENTITLEMENT_ID: str = "plus"
    REVENUECAT_PROJECT_ID: str = ""
    REVENUECAT_SECRET_API_KEY: str = ""
    REVENUECAT_WEBHOOK_AUTHORIZATION: str = ""
    REVENUECAT_WEBHOOK_SIGNING_SECRET: str = ""
    REVENUECAT_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS: int = 300

    GOOGLE_CLIENT_ID: str

    APPLE_IOS_BUNDLE_ID: str = "com.hatrick.app"

    # --- Hardcoded below, no .env needed ---

    @cached_property
    def geo_path(self) -> str:
        base_dir = Path(__file__).resolve().parents[3]
        return str(base_dir / "data" / "geoip.mmdb")

    @cached_property
    def cf_guard_enabled(self) -> bool:
        return False

    @cached_property
    def trusted_proxy_count(self) -> int:
        return 0

    @cached_property
    def app(self) -> AppConfig:
        return AppConfig()

    @cached_property
    def resend(self) -> ResendConfig:
        return ResendConfig(
            api_key=self.RESEND_API_KEY,
            sender_email=self.RESEND_SENDER_EMAIL,
        )

    @cached_property
    def otp(self) -> OTPConfig:
        return OTPConfig(expire_minutes=10)

    @cached_property
    def session(self) -> SessionConfig:
        return SessionConfig(
            expire_days=60,
            cookie_secure=True,
            cookie_samesite="none",
        )

    @cached_property
    def aes_key(self) -> bytes:
        return base64.b64decode(self.AES_MASTER_KEY_B64)

    @cached_property
    def blake2s_hashing_key(self) -> bytes:
        return base64.b64decode(self.BLAKE2S_HASHING_KEY_B64)

    @cached_property
    def psql_dsn(self) -> str:
        return self.PSQL_URL

    @cached_property
    def redis_url(self) -> str:
        return self.REDIS_URL

    @cached_property
    def cors_allowed_origins(self) -> list[str]:
        return [
            "https://hatrick.app",
            "https://www.hatrick.app",
            "capacitor://localhost",
            "ionic://localhost",
            "http://localhost:3000",
            "http://localhost",
            "https://localhost",
        ]

    @cached_property
    def google(self) -> GoogleConfig:
        return GoogleConfig(
            client_id=self.GOOGLE_CLIENT_ID,
        )

    @cached_property
    def apple(self) -> AppleConfig:
        return AppleConfig(
            ios_bundle_id=self.APPLE_IOS_BUNDLE_ID,
        )

    @cached_property
    def api_football(self) -> ApiFootballConfig:
        return ApiFootballConfig(
            api_key=self.API_FOOTBALL_KEY,
            base_url=self.API_FOOTBALL_BASE_URL.rstrip("/"),
        )

    @cached_property
    def revenuecat(self) -> RevenueCatConfig:
        return RevenueCatConfig(
            entitlement_id=self.REVENUECAT_ENTITLEMENT_ID.strip(),
            project_id=self.REVENUECAT_PROJECT_ID.strip(),
            secret_api_key=self.REVENUECAT_SECRET_API_KEY.strip(),
            webhook_authorization=self.REVENUECAT_WEBHOOK_AUTHORIZATION.strip(),
            webhook_signing_secret=self.REVENUECAT_WEBHOOK_SIGNING_SECRET.strip(),
            webhook_signature_tolerance_seconds=self.REVENUECAT_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS,
        )

settings = Settings()
