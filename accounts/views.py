import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import PhoneOTP
from .phone import hash_otp, mask_phone, validate_phone

OTP_TTL_SECONDS = 300
OTP_RESEND_SECONDS = 30
OTP_MAX_ATTEMPTS = 5


class RequestOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_phone(self, value):
        try:
            return validate_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc


class VerifyOtpSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    otp = serializers.CharField(min_length=4, max_length=8)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_phone(self, value):
        try:
            return validate_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

    def validate_otp(self, value):
        code = "".join(ch for ch in str(value) if ch.isdigit())
        if len(code) != 6:
            raise serializers.ValidationError("Enter the 6-digit OTP.")
        return code


def user_payload(user):
    phone = user.username
    name = user.get_full_name().strip() or f"User {phone[-4:]}"
    return {
        "id": user.id,
        "phone": phone,
        "phone_display": mask_phone(phone),
        "full_name": name,
    }


def get_or_create_phone_user(phone: str, full_name: str = ""):
    user, created = User.objects.get_or_create(
        username=phone,
        defaults={"email": ""},
    )
    if created:
        user.set_unusable_password()
    name = (full_name or "").strip()
    if name:
        parts = name.split(None, 1)
        user.first_name = parts[0][:30]
        user.last_name = (parts[1] if len(parts) > 1 else "")[:150]
    if created or name:
        user.save()
    return user, created


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["GET"])
@permission_classes([AllowAny])
def me_view(request):
    if not request.user.is_authenticated:
        return Response({"authenticated": False, "user": None})
    return Response({"authenticated": True, "user": user_payload(request.user)})


@api_view(["POST"])
@permission_classes([AllowAny])
def request_otp_view(request):
    serializer = RequestOtpSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    phone = serializer.validated_data["phone"]

    latest = PhoneOTP.objects.filter(phone=phone, consumed=False).order_by("-created_at").first()
    if latest and timezone.now() - latest.created_at < timedelta(seconds=OTP_RESEND_SECONDS):
        wait = OTP_RESEND_SECONDS - int((timezone.now() - latest.created_at).total_seconds())
        return Response(
            {"detail": f"Please wait {max(wait, 1)} seconds before requesting another OTP."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    code = f"{secrets.randbelow(1_000_000):06d}"
    PhoneOTP.objects.filter(phone=phone, consumed=False).update(consumed=True)
    PhoneOTP.objects.create(phone=phone, code_hash=hash_otp(phone, code))

    # No SMS gateway wired yet — in DEBUG the OTP is returned for local testing.
    payload = {
        "message": f"OTP sent to {mask_phone(phone)}.",
        "phone": phone,
        "phone_display": mask_phone(phone),
        "expires_in": OTP_TTL_SECONDS,
        "resend_in": OTP_RESEND_SECONDS,
    }
    if settings.DEBUG:
        payload["debug_otp"] = code
    return Response(payload)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp_view(request):
    serializer = VerifyOtpSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    phone = serializer.validated_data["phone"]
    code = serializer.validated_data["otp"]
    full_name = serializer.validated_data.get("full_name") or ""

    otp_row = (
        PhoneOTP.objects.filter(phone=phone, consumed=False)
        .order_by("-created_at")
        .first()
    )
    if otp_row is None:
        return Response(
            {"detail": "No OTP found. Request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if timezone.now() - otp_row.created_at > timedelta(seconds=OTP_TTL_SECONDS):
        otp_row.consumed = True
        otp_row.save(update_fields=["consumed"])
        return Response(
            {"detail": "OTP expired. Request a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if otp_row.attempts >= OTP_MAX_ATTEMPTS:
        otp_row.consumed = True
        otp_row.save(update_fields=["consumed"])
        return Response(
            {"detail": "Too many incorrect attempts. Request a new OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if otp_row.code_hash != hash_otp(phone, code):
        otp_row.attempts += 1
        otp_row.save(update_fields=["attempts"])
        return Response(
            {"detail": "Incorrect OTP. Please try again."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_row.consumed = True
    otp_row.save(update_fields=["consumed"])

    user, created = get_or_create_phone_user(phone, full_name=full_name)
    login(request, user)
    return Response(
        {
            "message": "Account created. You are now signed in." if created else "Signed in successfully.",
            "created": created,
            "user": user_payload(user),
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Signed out."})
