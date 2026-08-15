from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Donation
from .serializers import DonationSubmitSerializer


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def submit_donation(request):
    serializer = DonationSubmitSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    donation = Donation.objects.create(
        full_name=data["full_name"],
        email=data["email"],
        phone=data["phone"],
        amount=data["amount"],
        purpose=data["purpose"],
        pan=data.get("pan", ""),
        message=data.get("message", ""),
    )

    return Response(
        {
            "success": True,
            "donation_id": donation.pk,
            "message": "Thank you! Your donation request has been received. We will contact you shortly.",
        },
        status=status.HTTP_201_CREATED,
    )
