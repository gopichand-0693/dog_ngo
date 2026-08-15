from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("shelters.api_urls")),
    path("api/donations/", include("donations.urls")),
    path("api/auth/", include("accounts.urls")),
    path("", include("pages.urls")),
]
