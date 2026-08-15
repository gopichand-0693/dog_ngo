from rest_framework import serializers

from .models import DonationPurpose


class DonationSubmitSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    amount = serializers.IntegerField(min_value=100, max_value=500000)
    purpose = serializers.ChoiceField(choices=DonationPurpose.choices)
    pan = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")
    message = serializers.CharField(required=False, allow_blank=True, default="", max_length=500)

    def validate_phone(self, value):
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 10:
            raise serializers.ValidationError("Enter a valid 10-digit phone number.")
        return value.strip()

    def validate_pan(self, value):
        value = (value or "").strip().upper()
        if value and len(value) != 10:
            raise serializers.ValidationError("PAN must be 10 characters.")
        return value
