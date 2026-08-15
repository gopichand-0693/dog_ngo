from rest_framework import serializers

from shelters.models import Shelter


class ShelterListSerializer(serializers.ModelSerializer):
    city_display = serializers.CharField(source="get_city_display", read_only=True)
    area_display = serializers.CharField(source="get_area_display", read_only=True)
    service_labels = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    class Meta:
        model = Shelter
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "city",
            "city_display",
            "area",
            "area_display",
            "phone",
            "services",
            "service_labels",
            "emergency_rescue",
            "featured",
            "url",
        ]

    def get_service_labels(self, obj):
        return obj.service_labels

    def get_url(self, obj):
        return f"/shelters/{obj.slug}/"


class ShelterDetailSerializer(ShelterListSerializer):
    class Meta(ShelterListSerializer.Meta):
        fields = ShelterListSerializer.Meta.fields + [
            "description",
            "address",
            "phone_secondary",
            "email",
            "website",
            "hours",
            "accepts_volunteers",
            "accepts_donations",
        ]


class ShelterStatsSerializer(serializers.Serializer):
    shelter_count = serializers.IntegerField()
    emergency_count = serializers.IntegerField()
    areas_count = serializers.IntegerField()
    cities = serializers.ListField()
    areas = serializers.ListField()
    service_options = serializers.ListField()
    city = serializers.CharField(allow_null=True, required=False)
