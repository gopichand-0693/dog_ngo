from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from shelters.models import Shelter
from shelters.serializers import (
    ShelterDetailSerializer,
    ShelterListSerializer,
    ShelterStatsSerializer,
)

SERVICE_OPTIONS = [
    {"value": "rescue", "label": "Rescue"},
    {"value": "adoption", "label": "Adoption"},
    {"value": "abc", "label": "ABC / Sterilization"},
    {"value": "veterinary", "label": "Veterinary"},
    {"value": "foster", "label": "Foster"},
    {"value": "cruelty", "label": "Cruelty Response"},
]


class ShelterViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    queryset = Shelter.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ShelterDetailSerializer
        return ShelterListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        q = params.get("q", "").strip()
        city = params.get("city", "").strip()
        area = params.get("area", "").strip()
        service = params.get("service", "").strip()
        emergency = params.get("emergency", "").strip()
        featured = params.get("featured", "").strip()

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
        if emergency in {"1", "true", "True"}:
            qs = qs.filter(emergency_rescue=True)
        if featured in {"1", "true", "True"}:
            qs = qs.filter(featured=True)
        return qs

    @action(detail=True, methods=["get"])
    def nearby(self, request, slug=None):
        shelter = self.get_object()
        nearby = (
            Shelter.objects.filter(
                is_active=True,
                city=shelter.city,
                area=shelter.area,
            )
            .exclude(pk=shelter.pk)[:3]
        )
        if nearby.count() < 3:
            extra = (
                Shelter.objects.filter(is_active=True, city=shelter.city)
                .exclude(pk=shelter.pk)
                .exclude(pk__in=nearby.values_list("pk", flat=True))[: 3 - nearby.count()]
            )
            nearby = list(nearby) + list(extra)
        return Response(ShelterListSerializer(nearby, many=True).data)


@api_view(["GET"])
def meta_view(request):
    city = request.query_params.get("city", "").strip()
    active = Shelter.objects.filter(is_active=True)
    scoped = active.filter(city=city) if city else active

    data = {
        "shelter_count": scoped.count(),
        "emergency_count": scoped.filter(emergency_rescue=True).count(),
        "areas_count": scoped.values("area").distinct().count(),
        "cities": [{"value": v, "label": l} for v, l in Shelter.City.choices],
        "areas": Shelter.areas_for_city(city) if city else [
            {"value": v, "label": l} for v, l in Shelter.Area.choices
        ],
        "service_options": SERVICE_OPTIONS,
        "city": city or None,
    }
    serializer = ShelterStatsSerializer(data)
    return Response(serializer.data)
