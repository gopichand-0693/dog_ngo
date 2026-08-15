from django.urls import path

from .views import ShelterDetailView, ShelterListView

app_name = "shelters"

urlpatterns = [
    path("", ShelterListView.as_view(), name="list"),
    path("<slug:slug>/", ShelterDetailView.as_view(), name="detail"),
]
