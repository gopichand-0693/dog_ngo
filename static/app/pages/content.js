/** Static page copy for ScoobyHouse site sections. */
export const STATIC_PAGES = {
  "about-us": {
    title: "About Us",
    eyebrow: "About Us",
    heading: "A shared map of care across Hyderabad.",
    lede: "ScoobyHouse gathers public contacts for rescue NGOs, municipal ABC centres, and foster networks — so neighbours can act when a street dog needs help.",
    sections: [
      {
        heading: "Our mission",
        body: "We connect people who find street dogs in need with the shelters, rescuers, and NGOs already doing the work across Hyderabad.",
      },
      {
        heading: "What we are not",
        body: "ScoobyHouse is not a shelter. We do not replace GHMC, PFA, Blue Cross, or any listed organisation. Always confirm hours and capacity before visiting.",
      },
    ],
    cta: { label: "Browse shelters", href: "/shelters/" },
  },
  "our-work": {
    title: "Our Work",
    eyebrow: "Our Work",
    heading: "Making shelter help easier to find.",
    lede: "We maintain a living directory of rescue homes, ABC programmes, adoption NGOs, and emergency response teams in Hyderabad.",
    sections: [
      {
        heading: "Directory",
        body: "Verified public listings with phone numbers, areas served, and services — searchable by neighbourhood and need.",
      },
      {
        heading: "Emergency pathways",
        body: "Groups that answer after-hours rescue calls are flagged so you can reach the right team when minutes matter.",
      },
      {
        heading: "Community updates",
        body: "Listings are updated as organisations share new contacts, services, or capacity. Know a shelter we missed? Tell us.",
      },
    ],
    cta: { label: "See our directory", href: "/shelters/" },
  },
  "get-involved": {
    title: "Get Involved",
    eyebrow: "Get Involved",
    heading: "Many ways to help Hyderabad’s street dogs.",
    lede: "You do not need to run a shelter to make a difference. Start where you are.",
    sections: [
      {
        heading: "Volunteer",
        body: "Walk dogs, help with feeding rounds, transport to clinics, or support adoption events at a shelter near you.",
      },
      {
        heading: "Foster",
        body: "Short-term foster homes free up shelter space for the next rescue and give dogs a calmer place to heal.",
      },
      {
        heading: "Share listings",
        body: "Send ScoobyHouse to neighbours, housing societies, and local groups so more people know whom to call.",
      },
    ],
    cta: { label: "Find a shelter to support", href: "/shelters/" },
  },
  donate: {
    title: "Donate",
    eyebrow: "Donate",
    heading: "Support the teams on the ground.",
    lede: "Shelters and NGOs rely on donations for food, medicine, sterilisation camps, and emergency care.",
    sections: [],
    useDonateForm: true,
  },
  csr: {
    title: "CSR",
    eyebrow: "CSR",
    heading: "Corporate partnerships for animal welfare.",
    lede: "Companies in Hyderabad can sponsor sterilisation drives, shelter infrastructure, or employee volunteer days.",
    sections: [
      {
        heading: "Partnership models",
        body: "Fund ABC camps in a chosen area, donate monthly food supplies, or match employee giving to verified NGOs.",
      },
      {
        heading: "Impact reporting",
        body: "We connect you with shelter partners who can share outcomes — dogs treated, sterilised, and rehomed.",
      },
    ],
    cta: { label: "Contact us", href: "/contact/" },
  },
  faqs: {
    title: "FAQs",
    eyebrow: "FAQs",
    heading: "Common questions.",
    lede: "Quick answers about ScoobyHouse and how to use the directory.",
    sections: [
      {
        heading: "Is ScoobyHouse a shelter?",
        body: "No. We are a directory. Always contact the listed organisation directly for rescue, adoption, or surrender.",
      },
      {
        heading: "How do I report an injured dog?",
        body: "Open the shelter directory, filter for emergency rescue if needed, and call the nearest listed team. Share location and what you see.",
      },
      {
        heading: "How accurate are listings?",
        body: "Details come from public sources and partner updates. Phone numbers and hours can change — confirm before visiting.",
      },
      {
        heading: "Can I add a shelter?",
        body: "Yes. Reach out via Contact or use the admin listing flow if you manage shelter data.",
      },
    ],
    cta: { label: "Browse shelters", href: "/shelters/" },
  },
  contact: {
    title: "Contact",
    eyebrow: "Contact",
    heading: "Get in touch.",
    lede: "Questions about the directory, partnership enquiries, or corrections to a listing.",
    sections: [
      {
        heading: "Directory updates",
        body: "Email or message us with the shelter name, corrected phone number, area, and services offered.",
      },
      {
        heading: "CSR & partnerships",
        body: "For corporate social responsibility enquiries, use the subject line “CSR” and we will connect you with the right team.",
      },
      {
        heading: "General",
        body: "For urgent animal rescue, please call a listed shelter directly — ScoobyHouse does not operate a rescue helpline.",
      },
    ],
    cta: { label: "View shelters", href: "/shelters/" },
  },
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/", slug: "about-us" },
  { label: "Our Work", href: "/our-work/", slug: "our-work" },
  { label: "Get Involved", href: "/get-involved/", slug: "get-involved" },
  { label: "Donate", href: "/donate/", slug: "donate" },
  { label: "CSR", href: "/csr/", slug: "csr" },
  { label: "FAQs", href: "/faqs/", slug: "faqs" },
  { label: "Contact", href: "/contact/", slug: "contact" },
];
