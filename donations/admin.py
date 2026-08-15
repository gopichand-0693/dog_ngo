from django.contrib import admin

from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "amount", "purpose", "status", "created_at", "paid_at")
    list_filter = ("status", "purpose", "created_at")
    search_fields = ("full_name", "email", "phone", "razorpay_order_id", "razorpay_payment_id")
    readonly_fields = (
        "created_at",
        "paid_at",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
    )
