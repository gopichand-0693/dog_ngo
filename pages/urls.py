from django.urls import path

from .views import SpaView

app_name = "pages"

urlpatterns = [
    path("", SpaView.as_view(), name="home"),
    path("about/", SpaView.as_view(), name="about"),
    path("about-us/", SpaView.as_view(), name="about-us"),
    path("our-work/", SpaView.as_view(), name="our-work"),
    path("get-involved/", SpaView.as_view(), name="get-involved"),
    path("donate/", SpaView.as_view(), name="donate"),
    path("csr/", SpaView.as_view(), name="csr"),
    path("faqs/", SpaView.as_view(), name="faqs"),
    path("contact/", SpaView.as_view(), name="contact"),
    path("login/", SpaView.as_view(), name="login"),
    path("signup/", SpaView.as_view(), name="signup"),
    path("shelters/", SpaView.as_view(), name="shelters"),
    path("shelters/<slug:slug>/", SpaView.as_view(), name="shelter-detail"),
]
