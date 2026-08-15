import hashlib
import re

from django.conf import settings


PHONE_RE = re.compile(r"^[6-9]\d{9}$")


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", str(value or ""))
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if digits.startswith("0") and len(digits) == 11:
        digits = digits[1:]
    return digits


def validate_phone(value: str) -> str:
    phone = normalize_phone(value)
    if not PHONE_RE.fullmatch(phone):
        raise ValueError("Enter a valid 10-digit Indian mobile number.")
    return phone


def mask_phone(phone: str) -> str:
    phone = normalize_phone(phone)
    if len(phone) != 10:
        return phone
    return f"+91 {phone[:2]}****{phone[-2:]}"


def hash_otp(phone: str, code: str) -> str:
    raw = f"{phone}:{code}:{settings.SECRET_KEY}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
