from django.db import models


class DonationPurpose(models.TextChoices):
    GENERAL = "general", "General fund"
    EMERGENCY = "emergency", "Emergency rescue"
    ABC = "abc", "ABC / sterilisation"
    FOOD_MEDICINE = "food_medicine", "Food & medicine"
    SHELTER = "shelter", "Shelter upkeep"


class DonationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"


class Donation(models.Model):
    full_name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    amount = models.PositiveIntegerField(help_text="Amount in INR")
    purpose = models.CharField(max_length=32, choices=DonationPurpose.choices)
    pan = models.CharField(max_length=10, blank=True)
    message = models.TextField(blank=True)
    razorpay_order_id = models.CharField(max_length=64, blank=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=64, blank=True)
    razorpay_signature = models.CharField(max_length=128, blank=True)
    status = models.CharField(
        max_length=16,
        choices=DonationStatus.choices,
        default=DonationStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} · ₹{self.amount} ({self.status})"
