import base64
import json
import time

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
import httpx

from server.src.app.config.settings import settings

GOOGLE_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


def _base64url_decode(data: str) -> bytes:
    padded = data + "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(padded)


def _decode_jwt_segment(segment: str) -> dict:
    return json.loads(_base64url_decode(segment))


def _public_key_from_jwk(jwk: dict):
    numbers = rsa.RSAPublicNumbers(
        e=int.from_bytes(_base64url_decode(jwk["e"]), "big"),
        n=int.from_bytes(_base64url_decode(jwk["n"]), "big"),
    )
    return numbers.public_key()


async def verify_google_id_token(client: httpx.AsyncClient, id_token: str) -> dict:
    try:
        header_segment, payload_segment, signature_segment = id_token.split(".")
    except ValueError as exc:
        raise ValueError("Malformed Google identity token.") from exc

    header = _decode_jwt_segment(header_segment)
    claims = _decode_jwt_segment(payload_segment)
    if header.get("alg") != "RS256" or not header.get("kid"):
        raise ValueError("Unsupported Google identity token header.")

    response = await client.get(settings.google.keys_url)
    response.raise_for_status()
    jwks = response.json()
    jwk = next((key for key in jwks.get("keys", []) if key.get("kid") == header["kid"]), None)
    if jwk is None:
        raise ValueError("No matching Google public key.")

    public_key = _public_key_from_jwk(jwk)
    public_key.verify(
        _base64url_decode(signature_segment),
        f"{header_segment}.{payload_segment}".encode(),
        padding.PKCS1v15(),
        hashes.SHA256(),
    )

    now = int(time.time())
    if claims.get("iss") not in GOOGLE_ISSUERS:
        raise ValueError("Invalid Google identity token issuer.")
    if claims.get("aud") != settings.google.client_id:
        raise ValueError("Invalid Google identity token audience.")
    if not isinstance(claims.get("exp"), int) or claims["exp"] <= now:
        raise ValueError("Expired Google identity token.")

    return claims
