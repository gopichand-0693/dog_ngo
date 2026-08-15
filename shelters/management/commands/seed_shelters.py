from django.core.management.base import BaseCommand

from shelters.models import Shelter

SHELTERS = [
{
        "name": "People For Animals Hyderabad",
        "short_description": "24-hour emergency rescue and cruelty response across Hyderabad.",
        "description": (
            "People For Animals (PFA) Hyderabad runs an office in Secunderabad and an "
            "emergency rescue home in Begum Bazar. Volunteers and staff respond to sick "
            "or injured animals around the clock, handle cruelty complaints, and support "
            "ongoing rehabilitation for street dogs and other companion animals."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.BEGUM_BAZAR,
        "address": (
            "Emergency Rescue Home: 14-7-95, Opp. Goodwill School, Near Muslim Jung Pul, "
            "Begum Bazar, Hyderabad 500012. Office: 5-4-72, Opp. Sundaram Motors, "
            "M.G. Road, Ranigunj, Secunderabad 500003"
        ),
        "phone": "+91 73374 50643",
        "phone_secondary": "+91 73309 62323",
        "email": "communication@pfahyd.org",
        "website": "https://pfahyd.org/",
        "hours": "Rescue: 24 hours · Office: 10:00 AM – 6:30 PM",
        "services": ["rescue", "veterinary", "cruelty", "foster"],
        "emergency_rescue": True,
        "featured": True,
    },
    {
        "name": "Blue Cross of Hyderabad",
        "short_description": "City-focused ABC/ARV programs and adoption drives in West Zone.",
        "description": (
            "Blue Cross of Hyderabad concentrates on Animal Birth Control and Anti-Rabies "
            "Vaccination for street dogs, working with GHMC across Jubilee Hills, Banjara "
            "Hills, and the West Zone. They also run adoption drives and public education "
            "on coexistence with community dogs."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.JUBILEE_HILLS,
        "address": "403/9, Road No. 35, Jubilee Hills, Hyderabad",
        "phone": "+91 88866 76070",
        "email": "",
        "website": "https://bluecrossofhyd.org/",
        "hours": "Tue–Sun, 10:00 AM – 12:00 PM (adoption / camps)",
        "services": ["abc", "adoption", "veterinary"],
        "emergency_rescue": False,
        "featured": True,
    },
    {
        "name": "BREATH Animal Rescue Home",
        "short_description": "Large shelter campus in Bowrampet with clinic and sanctuary care.",
        "description": (
            "BREATH (Stray Animal Foundation India) operates a half-acre rescue home in "
            "Bowrampet with dozens of kennels, a clinic, isolation wards, and dedicated "
            "spaces for puppies and paralyzed dogs. They take owner surrenders and focus "
            "on long-term rehabilitation for Hyderabad's street animals."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.BOWRAMPET,
        "address": "Bowrampet, Hyderabad, Telangana",
        "phone": "+91 99496 79131",
        "email": "info@strayanimalfoundationindia.org",
        "website": "https://strayanimalfoundationindia.org/shelter/",
        "hours": "By appointment · inquiries via email / phone",
        "services": ["rescue", "veterinary", "foster", "adoption"],
        "emergency_rescue": True,
        "featured": True,
    },
    {
        "name": "Citizens For Animals",
        "short_description": "Street dog rescue and care based in Old Nallakunta.",
        "description": (
            "Citizens For Animals supports street dog rescue and ongoing care in central "
            "Hyderabad. Reach out for injured community dogs in and around Old Nallakunta "
            "and neighbouring localities."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.NALLAKUNTA,
        "address": "Old Nallakunta, Hyderabad, Telangana",
        "phone": "+91 78422 27344",
        "hours": "Daytime rescue coordination",
        "services": ["rescue", "foster"],
        "emergency_rescue": True,
        "featured": False,
    },
    {
        "name": "Animal Warriors Conservation Society",
        "short_description": "Tactical rescue for animals and urban wildlife across the city.",
        "description": (
            "Animal Warriors Conservation Society specializes in tactical rescues — from "
            "street dogs in distress to urban wildlife situations. Call when an animal is "
            "trapped, injured in a hard-to-reach spot, or needs coordinated extraction."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.OTHER,
        "address": "Hyderabad (citywide response)",
        "phone": "+91 96978 87888",
        "hours": "On-call rescue",
        "services": ["rescue", "cruelty"],
        "emergency_rescue": True,
        "featured": False,
    },
    {
        "name": "SWAN – Shakuntala Society",
        "short_description": "Rescue and rehabilitation for street dogs from Himayathnagar.",
        "description": (
            "SWAN (Shakuntala Society for Welfare of Animals and Nature) works on street "
            "dog rescue, rehabilitation, and broader animal welfare advocacy from their "
            "Himayathnagar base."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.HIMAYATHNAGAR,
        "address": (
            "3-6-719/1, Seetaram Apartments, Himayathnagar, Street Number 12, "
            "Hyderabad, Telangana 500029"
        ),
        "phone": "+91 99669 03030",
        "hours": "Coordination during business hours",
        "services": ["rescue", "foster", "adoption"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "Asara Animal Shelter",
        "short_description": "Shelter and care for abandoned and injured animals in Bowrampet.",
        "description": (
            "Asara focuses on providing shelter and care for abandoned and injured animals "
            "in the Bowrampet area of Hyderabad, supporting recovery and rehoming where "
            "possible."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.BOWRAMPET,
        "address": "Bowrampet, Hyderabad, India",
        "phone": "+91 73311 22811",
        "hours": "By phone appointment",
        "services": ["rescue", "foster", "veterinary"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "GHMC Animal Birth Control Centres",
        "short_description": "Municipal ABC centres and shelters for sterilization and adoption.",
        "description": (
            "Greater Hyderabad Municipal Corporation runs multiple Animal Birth Control "
            "centres and animal shelters across the city. Use these facilities for ABC/ARV "
            "support and municipal pet adoption pathways near your locality."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.METTAKANIGUDEM,
        "address": "8/8, Rajiv Swagruha TWP, Mettakanigudem, Hyderabad (and 17+ centres citywide)",
        "phone": "+91 90009 01937",
        "hours": "Municipal centre hours vary by location",
        "services": ["abc", "adoption", "veterinary"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "Jeeva Vaatsalya Rescue Centre",
        "short_description": "Rescue and rehabilitation centre serving Bachupally and north Hyd.",
        "description": (
            "Jeeva Vaatsalya Rescue and Rehabilitation Centre focuses on rescue and "
            "rehab for animals in need across Bachupally and surrounding northern "
            "Hyderabad neighbourhoods."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.BACHUPALLY,
        "address": "Bachupally, Hyderabad, Telangana 500090",
        "phone": "+91 77998 86828",
        "hours": "By phone coordination",
        "services": ["rescue", "veterinary", "foster"],
        "emergency_rescue": True,
        "featured": False,
    },
    {
        "name": "Life is Bliss",
        "short_description": "Rescue and care coordination from Somajiguda / Raj Bhavan Road.",
        "description": (
            "Life is Bliss offers rescue and care support for street animals, coordinating "
            "help from their Somajiguda base near Raj Bhavan Road."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.SOMAJIGUDA,
        "address": "Raj Bhavan Road, Somajiguda, Hyderabad",
        "phone": "+91 91105 78329",
        "phone_secondary": "+91 72078 70135",
        "hours": "Daytime coordination",
        "services": ["rescue", "foster"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "Angelic Foundation",
        "short_description": "Care and shelter for animals near Boudha Nagar.",
        "description": (
            "Angelic Foundation provides care and shelter for animals in need, operating "
            "near St Albans High School in Boudha Nagar, Hyderabad."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.OTHER,
        "address": "Near St Albans High School, Boudha Nagar, Hyderabad",
        "phone": "+91 91003 89009",
        "hours": "By appointment",
        "services": ["rescue", "foster", "adoption"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "Animal Rescue Centre (ARC)",
        "short_description": "Rescue and rehabilitation centre based in Jubilee Hills.",
        "description": (
            "ARC is a rescue and rehabilitation centre for animals, based in Jubilee Hills. "
            "Contact them for rehab support and rescue coordination in west Hyderabad."
        ),
        "city": Shelter.City.HYDERABAD,
        "area": Shelter.Area.JUBILEE_HILLS,
        "address": "Plot No. 270, Road No. 10, Jubilee Hills, Hyderabad, Telangana 500033",
        "phone": "+91 73863 82835",
        "hours": "By phone appointment",
        "services": ["rescue", "veterinary", "foster"],
        "emergency_rescue": False,
        "featured": False,
    },
    # —— Bangalore ——
    {
        "name": "CUPA Bangalore",
        "short_description": "Compassion Unlimited Plus Action — rescue, ABC, and clinic care across Bengaluru.",
        "description": (
            "CUPA (Compassion Unlimited Plus Action) is one of Bengaluru's longest-running "
            "animal welfare organisations, supporting street dog rescue, sterilisation, "
            "adoption, and veterinary care across the city."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.BANASHANKARI,
        "address": "CUPA, Bengaluru, Karnataka",
        "phone": "+91 80 2294 7317",
        "website": "https://cupabangalore.org/",
        "hours": "Clinic / helpline hours vary — call ahead",
        "services": ["rescue", "abc", "veterinary", "adoption"],
        "emergency_rescue": True,
        "featured": True,
    },
    {
        "name": "Charlie's Animal Rescue Centre (CARE)",
        "short_description": "Large sanctuary and rescue home for street dogs near Kengeri.",
        "description": (
            "CARE provides sanctuary care, medical treatment, and rehabilitation for street "
            "dogs in and around Bengaluru, with a campus near Kengeri serving as a long-term "
            "home for animals that need ongoing support."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.KENGERI,
        "address": "Near Kengeri, Bengaluru, Karnataka",
        "phone": "+91 98450 88802",
        "website": "https://carebarkids.com/",
        "hours": "Visits by appointment",
        "services": ["rescue", "veterinary", "foster", "adoption"],
        "emergency_rescue": True,
        "featured": True,
    },
    {
        "name": "Animal Rights Fund Bangalore",
        "short_description": "Rescue and ABC support for community dogs across the city.",
        "description": (
            "Animal Rights Fund works on street dog rescue, sterilisation camps, and "
            "community care programmes across Bengaluru neighbourhoods."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.JAYANAGAR,
        "address": "Jayanagar / citywide response, Bengaluru",
        "phone": "+91 98450 44909",
        "hours": "Daytime rescue coordination",
        "services": ["rescue", "abc", "cruelty"],
        "emergency_rescue": True,
        "featured": True,
    },
    {
        "name": "Sarvoham Animal Foundation",
        "short_description": "Rescue, rehab, and adoption for indie dogs in north Bengaluru.",
        "description": (
            "Sarvoham focuses on rescuing injured and abandoned dogs, providing "
            "rehabilitation, and finding adoptive homes — with strong coverage in "
            "north Bengaluru localities."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.HEBBAL,
        "address": "Hebbal / north Bengaluru, Karnataka",
        "phone": "+91 99000 88444",
        "hours": "By phone coordination",
        "services": ["rescue", "foster", "adoption", "veterinary"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "Voice of Stray Dogs (VOSD) Bangalore",
        "short_description": "Shelter and medical care for street dogs, including special-needs cases.",
        "description": (
            "VOSD runs shelter and medical programmes for Bengaluru street dogs, including "
            "care for animals with disabilities and long-term rehabilitation needs."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.YELAHANKA,
        "address": "Bengaluru (shelter campus · inquire for directions)",
        "phone": "+91 99000 94000",
        "website": "https://vosd.in/",
        "hours": "Coordination via phone / website",
        "services": ["rescue", "veterinary", "foster"],
        "emergency_rescue": True,
        "featured": False,
    },
    {
        "name": "Friends of Animals Bangalore",
        "short_description": "Neighbourhood rescue and foster network in east Bengaluru.",
        "description": (
            "A volunteer-led network supporting injured street dogs with rescue transport, "
            "foster placements, and adoption coordination across Indiranagar, Whitefield, "
            "and nearby areas."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.INDIRANAGAR,
        "address": "Indiranagar / east Bengaluru",
        "phone": "+91 98800 11223",
        "hours": "Volunteer coordination · daytime",
        "services": ["rescue", "foster", "adoption"],
        "emergency_rescue": False,
        "featured": False,
    },
    {
        "name": "Whitefield Animal Rescue Collective",
        "short_description": "Local rescue and ABC referrals for Whitefield and ITPL corridor.",
        "description": (
            "Community rescuers coordinating emergency pickup, clinic referrals, and "
            "sterilisation camps for street dogs in Whitefield and surrounding tech-corridor "
            "neighbourhoods."
        ),
        "city": Shelter.City.BANGALORE,
        "area": Shelter.Area.WHITEFIELD,
        "address": "Whitefield, Bengaluru, Karnataka",
        "phone": "+91 97411 55660",
        "hours": "On-call daytime rescue",
        "services": ["rescue", "abc", "foster"],
        "emergency_rescue": True,
        "featured": False,
    },
]


class Command(BaseCommand):
    help = "Load Hyderabad and Bangalore dog shelter directory data"

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for data in SHELTERS:
            obj, was_created = Shelter.objects.update_or_create(
                name=data["name"],
                defaults=data,
            )
            if was_created:
                created += 1
            else:
                updated += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Shelters ready: {created} created, {updated} updated "
                f"({Shelter.objects.count()} total)."
            )
        )
