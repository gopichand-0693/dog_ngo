from django.contrib import admin

from .models import PhoneOTP


@admin.register(PhoneOTP)
class PhoneOTPAdmin(admin.ModelAdmin):
    list_display = ("phone", "created_at", "attempts", "consumed")
    list_filter = ("consumed",)
    search_fields = ("phone",)
    readonly_fields = ("phone", "code_hash", "created_at", "attempts", "consumed")
