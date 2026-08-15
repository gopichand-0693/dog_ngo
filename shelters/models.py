from django.db import models
from django.utils.text import slugify


class Shelter(models.Model):
    class City(models.TextChoices):
        HYDERABAD = "hyderabad", "Hyderabad"
        BANGALORE = "bangalore", "Bangalore"

    class Area(models.TextChoices):
        # Hyderabad
        JUBILEE_HILLS = "jubilee_hills", "Jubilee Hills"
        SECUNDERABAD = "secunderabad", "Secunderabad"
        BEGUM_BAZAR = "begum_bazar", "Begum Bazar"
        BOWRAMPET = "bowrampet", "Bowrampet"
        HIMAYATHNAGAR = "himayathnagar", "Himayathnagar"
        NALLAKUNTA = "nallakunta", "Nallakunta"
        BACHUPALLY = "bachupally", "Bachupally"
        SOMAJIGUDA = "somajiguda", "Somajiguda"
        METTAKANIGUDEM = "mettakanigudem", "Mettakanigudem"
        # Bangalore
        KORAMANGALA = "koramangala", "Koramangala"
        INDIRANAGAR = "indiranagar", "Indiranagar"
        WHITEFIELD = "whitefield", "Whitefield"
        JP_NAGAR = "jp_nagar", "JP Nagar"
        JAYANAGAR = "jayanagar", "Jayanagar"
        HEBBAL = "hebbal", "Hebbal"
        YELAHANKA = "yelahanka", "Yelahanka"
        ELECTRONIC_CITY = "electronic_city", "Electronic City"
        BANASHANKARI = "banashankari", "Banashankari"
        KENGERI = "kengeri", "Kengeri"
        OTHER = "other", "Other"

    HYDERABAD_AREAS = {
        Area.JUBILEE_HILLS,
        Area.SECUNDERABAD,
        Area.BEGUM_BAZAR,
        Area.BOWRAMPET,
        Area.HIMAYATHNAGAR,
        Area.NALLAKUNTA,
        Area.BACHUPALLY,
        Area.SOMAJIGUDA,
        Area.METTAKANIGUDEM,
        Area.OTHER,
    }

    BANGALORE_AREAS = {
        Area.KORAMANGALA,
        Area.INDIRANAGAR,
        Area.WHITEFIELD,
        Area.JP_NAGAR,
        Area.JAYANAGAR,
        Area.HEBBAL,
        Area.YELAHANKA,
        Area.ELECTRONIC_CITY,
        Area.BANASHANKARI,
        Area.KENGERI,
        Area.OTHER,
    }

    CITY_AREAS = {
        City.HYDERABAD: HYDERABAD_AREAS,
        City.BANGALORE: BANGALORE_AREAS,
    }

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=280)
    description = models.TextField()
    city = models.CharField(
        max_length=20,
        choices=City.choices,
        default=City.HYDERABAD,
        db_index=True,
    )
    area = models.CharField(max_length=40, choices=Area.choices, default=Area.OTHER)
    address = models.TextField()
    phone = models.CharField(max_length=40)
    phone_secondary = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    hours = models.CharField(max_length=120, blank=True)
    services = models.JSONField(
        default=list,
        help_text="List of services, e.g. rescue, adoption, ABC, veterinary",
    )
    accepts_volunteers = models.BooleanField(default=True)
    accepts_donations = models.BooleanField(default=True)
    emergency_rescue = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["city", "name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_city_display()})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "shelter"
            slug = base
            counter = 1
            while Shelter.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/shelters/{self.slug}/"

    @property
    def service_labels(self):
        return [s.replace("_", " ").title() for s in self.services]

    @classmethod
    def areas_for_city(cls, city: str):
        allowed = cls.CITY_AREAS.get(city)
        if not allowed:
            return [{"value": v, "label": l} for v, l in cls.Area.choices]
        return [{"value": v, "label": l} for v, l in cls.Area.choices if v in allowed]
