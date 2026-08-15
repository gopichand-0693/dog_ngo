from django.db.models import Q
from django.views.generic import DetailView, ListView

from .models import Shelter


class ShelterListView(ListView):
    model = Shelter
    template_name = "shelters/list.html"
    context_object_name = "shelters"
    paginate_by = 9

    def get_queryset(self):
        qs = Shelter.objects.filter(is_active=True)
        q = self.request.GET.get("q", "").strip()
        city = self.request.GET.get("city", "").strip()
        area = self.request.GET.get("area", "").strip()
        service = self.request.GET.get("service", "").strip()
        emergency = self.request.GET.get("emergency", "").strip()

        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(short_description__icontains=q)
                | Q(description__icontains=q)
                | Q(address__icontains=q)
                | Q(area__icontains=q)
                | Q(city__icontains=q)
            )
        if city:
            qs = qs.filter(city=city)
        if area:
            qs = qs.filter(area=area)
        if service:
            qs = qs.filter(services__contains=service)
        if emergency == "1":
            qs = qs.filter(emergency_rescue=True)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        city = self.request.GET.get("city", "").strip()
        context["cities"] = Shelter.City.choices
        context["areas"] = (
            [(a["value"], a["label"]) for a in Shelter.areas_for_city(city)]
            if city
            else Shelter.Area.choices
        )
        context["service_options"] = [
            ("rescue", "Rescue"),
            ("adoption", "Adoption"),
            ("abc", "ABC / Sterilization"),
            ("veterinary", "Veterinary"),
            ("foster", "Foster"),
            ("cruelty", "Cruelty Response"),
        ]
        context["current_q"] = self.request.GET.get("q", "")
        context["current_city"] = city
        context["current_area"] = self.request.GET.get("area", "")
        context["current_service"] = self.request.GET.get("service", "")
        context["current_emergency"] = self.request.GET.get("emergency", "")
        context["total_count"] = self.get_queryset().count()
        return context


class ShelterDetailView(DetailView):
    model = Shelter
    template_name = "shelters/detail.html"
    context_object_name = "shelter"
    slug_field = "slug"

    def get_queryset(self):
        return Shelter.objects.filter(is_active=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        shelter = self.object
        context["nearby"] = (
            Shelter.objects.filter(is_active=True, city=shelter.city, area=shelter.area)
            .exclude(pk=shelter.pk)[:3]
        )
        return context
