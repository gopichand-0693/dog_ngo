from django.urls import path

from .views import csrf_view, logout_view, me_view, request_otp_view, verify_otp_view

urlpatterns = [
    path("csrf/", csrf_view, name="csrf"),
    path("me/", me_view, name="me"),
    path("request-otp/", request_otp_view, name="request-otp"),
    path("verify-otp/", verify_otp_view, name="verify-otp"),
    path("logout/", logout_view, name="logout"),
]
