from django.urls import include, path
from rest_framework.routers import DefaultRouter

from shelters.api_views import ShelterViewSet, meta_view

router = DefaultRouter()
router.register("shelters", ShelterViewSet, basename="shelter")

urlpatterns = [
    path("meta/", meta_view, name="meta"),
    path("", include(router.urls)),
]
