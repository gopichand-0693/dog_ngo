from django.contrib import admin

from .models import Shelter


@admin.register(Shelter)
class ShelterAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "area",
        "phone",
        "emergency_rescue",
        "featured",
        "is_active",
    )
    list_filter = (
        "city",
        "area",
        "emergency_rescue",
        "featured",
        "is_active",
        "accepts_volunteers",
    )
    search_fields = ("name", "address", "phone", "short_description", "city")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")
