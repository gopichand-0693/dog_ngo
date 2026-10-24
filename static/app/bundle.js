// static/app/api.js
var API_BASE = "/api";
function csrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}
async function ensureCsrf() {
  if (csrfToken()) return;
  await fetch(`${API_BASE}/auth/csrf/`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" }
  });
}
async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs || 1e4);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json", ...options.headers || {} },
      body: options.body,
      signal: controller.signal
    });
    if (!response.ok) {
      const error = new Error(`Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}
function getMeta(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== void 0 && value !== null && String(value).length) {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return request(`/meta/${qs ? `?${qs}` : ""}`);
}
function listShelters(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== void 0 && value !== null && String(value).length) {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return request(`/shelters/${qs ? `?${qs}` : ""}`);
}
function getShelter(slug) {
  return request(`/shelters/${encodeURIComponent(slug)}/`);
}
function getNearby(slug) {
  return request(`/shelters/${encodeURIComponent(slug)}/nearby/`);
}
function submitDonation(payload) {
  return postJson("/donations/submit/", payload);
}
function getMe() {
  return request("/auth/me/");
}
function requestOtp(payload) {
  return postJson("/auth/request-otp/", payload);
}
function verifyOtp(payload) {
  return postJson("/auth/verify-otp/", payload);
}
function logout() {
  return postJson("/auth/logout/", {});
}
async function postJson(path, payload) {
  await ensureCsrf();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  const token = csrfToken();
  if (token) headers["X-CSRFToken"] = token;
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = data.detail;
    if (!message && typeof data === "object") {
      message = Object.entries(data).map(([key, value]) => {
        const label = Array.isArray(value) ? value.join(", ") : String(value);
        return `${key}: ${label}`;
      }).join("; ");
    }
    const error = new Error(message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// static/app/utils.js
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}
function setTitle(page) {
  document.title = page ? `${page} \xB7 ScoobyHouse` : "ScoobyHouse \xB7 Hyderabad dog shelters";
}
function loadingHtml(message = "Loading\u2026") {
  return `<div class="shell loading-state"><p class="muted">${escapeHtml(message)}</p></div>`;
}
function errorHtml(message) {
  return `
    <section class="page-hero shell">
      <h1>Something went wrong</h1>
      <p class="lede">${escapeHtml(message)}</p>
      <p><a class="btn btn-primary" href="/" data-link>Back home</a></p>
    </section>
  `;
}

// static/app/components/shelterCard.js
function shelterCard(shelter) {
  const emergency = shelter.emergency_rescue ? `<span class="pill">Emergency</span>` : "";
  const services = (shelter.service_labels || []).slice(0, 3).join(" \xB7 ");
  const place = [shelter.city_display, shelter.area_display].filter(Boolean).join(" \xB7 ");
  return `
    <a class="shelter-card" href="${escapeHtml(shelter.url)}" data-link>
      <div class="shelter-card-top">
        <p class="area">${escapeHtml(place)}</p>
        ${emergency}
      </div>
      <h3>${escapeHtml(shelter.name)}</h3>
      <p>${escapeHtml(shelter.short_description)}</p>
      ${services ? `<p class="service-line">${escapeHtml(services)}</p>` : ""}
      <span class="card-link">View details <span aria-hidden="true">\u2192</span></span>
    </a>
  `;
}
function observeCards(root) {
  const cards = root.querySelectorAll(".shelter-card");
  if (!("IntersectionObserver" in window) || !cards.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  cards.forEach((card) => observer.observe(card));
}

// static/app/components/logo.js
function logoMarkup(extraClass = "") {
  const classes = ["logo-dog", extraClass].filter(Boolean).join(" ");
  return `
    <svg class="${classes}" viewBox="0 0 40 40" width="50" height="50" aria-hidden="true" focusable="false">
      <rect class="logo-bg" width="40" height="40" rx="20" fill="#CC0000"/>
      <!-- soft snout pad -->
      <ellipse cx="20" cy="24.5" rx="12.5" ry="9.5" fill="#F3D7B8"/>
      <ellipse cx="20" cy="25.2" rx="10.8" ry="7.8" fill="#F8E0C8"/>
      <!-- cartoon nose -->
      <g class="logo-nose-group">
        <ellipse class="logo-nose" cx="20" cy="18.2" rx="9.2" ry="7.4" fill="#1A1816"/>
        <ellipse cx="20" cy="18.6" rx="8.2" ry="6.2" fill="#2B2826"/>
        <!-- nostrils -->
        <ellipse cx="16.2" cy="19.4" rx="2.1" ry="2.6" fill="#0B0A09"/>
        <ellipse cx="23.8" cy="19.4" rx="2.1" ry="2.6" fill="#0B0A09"/>
        <!-- gloss -->
        <ellipse class="logo-nose-shine" cx="15.8" cy="14.2" rx="3.4" ry="2.1" fill="#F5F5F5" opacity="0.9"/>
        <ellipse cx="24.8" cy="15.1" rx="1.3" ry="0.8" fill="#F5F5F5" opacity="0.45"/>
      </g>
      <!-- smile line -->
      <path d="M20 25.2 V29.5" stroke="#C4A484" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M14.5 29.8 C17 31.6 23 31.6 25.5 29.8" stroke="#C4A484" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    </svg>
  `;
}

// static/app/city.js
var CITY_KEY = "scooby_city";
var CITIES = [
  { value: "hyderabad", label: "Hyderabad" },
  { value: "bangalore", label: "Bangalore" }
];
function getSelectedCity() {
  try {
    const stored = localStorage.getItem(CITY_KEY) || "";
    if (CITIES.some((c) => c.value === stored)) return stored;
  } catch {
  }
  return "";
}
function setSelectedCity(city) {
  try {
    if (city) localStorage.setItem(CITY_KEY, city);
    else localStorage.removeItem(CITY_KEY);
  } catch {
  }
}
function cityLabel(city) {
  return CITIES.find((c) => c.value === city)?.label || "All cities";
}

// static/app/pages/home.js
var HERO_SLIDES = [
  {
    src: "/static/img/hero-farm-dog.jpg?v=1",
    alt: "Indie dog standing on a farm ledge looking at the camera",
    position: "72% 45%"
  },
  {
    src: "/static/img/hero-beach-dogs.jpg?v=1",
    alt: "Street dogs on a sandy beach with palms behind them",
    position: "70% 55%"
  },
  {
    src: "/static/img/hero-sidewalk-dog.jpg?v=1",
    alt: "Indie dog resting on a sunlit sidewalk",
    position: "68% 60%"
  }
];
function initHeroCarousel(root) {
  const carousel = root.querySelector("[data-hero-carousel]");
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll(".hero-slide")];
  const dots = [...carousel.querySelectorAll(".hero-dot")];
  if (slides.length < 2) return;
  let index = 0;
  let timer = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intervalMs = 5500;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  };
  const play = () => {
    if (reduceMotion) return;
    stop();
    timer = window.setInterval(() => show(index + 1), intervalMs);
  };
  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const next = Number(dot.dataset.index);
      if (Number.isNaN(next)) return;
      show(next);
      play();
    });
  });
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", play);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", play);
  show(0);
  play();
}
async function renderHome(root) {
  setTitle("Home");
  const [meta, featuredPayload] = await Promise.all([
    getMeta(),
    listShelters({ featured: "1", page_size: 3 })
  ]);
  let featured = featuredPayload.results || featuredPayload;
  if (!featured.length) {
    const fallback = await listShelters({ page_size: 3 });
    featured = fallback.results || fallback;
  }
  root.innerHTML = `
    <section class="hero" data-hero-carousel aria-roledescription="carousel" aria-label="Street dog photos">
      <div class="hero-media">
        ${HERO_SLIDES.map(
    (slide, i) => `
          <div
            class="hero-slide${i === 0 ? " is-active" : ""}"
            role="img"
            aria-label="${slide.alt}"
            aria-hidden="${i === 0 ? "false" : "true"}"
            style="background-image: url('${slide.src}'); background-position: ${slide.position};"
          ></div>`
  ).join("")}
      </div>
      <div class="hero-veil"></div>
      <div class="shell hero-copy">
        <p class="brand-lockup">
          ${logoMarkup("brand-lockup-mark")}
          <span><span class="brand-scooby">Scooby</span><span class="brand-house">House</span></span>
        </p>
        <h1>Find the right shelter in Hyderabad or Bangalore \u2014 fast.</h1>
        <p class="lede">One calm directory for rescue homes, ABC centres, and adoption NGOs across both cities.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="/shelters/?city=hyderabad" data-link>Hyderabad shelters</a>
          <a class="btn btn-ghost" href="/shelters/?city=bangalore" data-link>Bangalore shelters</a>
        </div>
        <div class="city-chip-row" aria-label="Cities">
          ${CITIES.map(
    (c) => `<a class="city-chip" href="/shelters/?city=${c.value}" data-link>${c.label}</a>`
  ).join("")}
        </div>
      </div>
      <div class="hero-carousel-nav" role="tablist" aria-label="Hero photos">
        ${HERO_SLIDES.map(
    (_, i) => `
          <button
            type="button"
            class="hero-dot${i === 0 ? " is-active" : ""}"
            data-index="${i}"
            role="tab"
            aria-label="Show photo ${i + 1}"
            aria-current="${i === 0 ? "true" : "false"}"
          ></button>`
  ).join("")}
      </div>
      <div class="hero-scroll" aria-hidden="true"><span></span></div>
    </section>

    <section class="section shell">
      <header class="section-head">
        <p class="eyebrow">How it works</p>
        <h2>Three steps from worry to a phone number.</h2>
        <p>Search by neighbourhood, service, or emergency need \u2014 then call the right team.</p>
      </header>
      <ol class="steps">
        <li>
          <span class="step-num">01</span>
          <h3>Find a shelter</h3>
          <p>${meta.shelter_count} listings across Hyderabad and Bangalore.</p>
        </li>
        <li>
          <span class="step-num">02</span>
          <h3>Check what they do</h3>
          <p>Rescue, ABC, adoption, foster, or cruelty response \u2014 clear at a glance.</p>
        </li>
        <li>
          <span class="step-num">03</span>
          <h3>Call or visit</h3>
          <p>${meta.emergency_count} groups keep emergency rescue lines when minutes matter.</p>
        </li>
      </ol>
    </section>

    <section class="section section-featured">
      <div class="shell">
        <header class="section-head section-head-row">
          <div>
            <p class="eyebrow">Directory</p>
            <h2>Featured shelters</h2>
            <p>Organisations people reach for first in Hyderabad and Bangalore.</p>
          </div>
          <a class="text-link" href="/shelters/" data-link>View all shelters</a>
        </header>
        <div class="shelter-grid">
          ${featured.map(shelterCard).join("") || `<p class="muted">No shelters loaded yet.</p>`}
        </div>
      </div>
    </section>

    <section class="section shell">
      <div class="band">
        <div class="band-copy">
          <h2>Know a shelter we missed?</h2>
          <p>ScoobyHouse grows with the community. Add a listing through admin when you find one.</p>
        </div>
        <a class="btn btn-on-dark" href="/admin/shelters/shelter/add/">Add a shelter</a>
      </div>
    </section>
  `;
  initHeroCarousel(root);
  observeCards(root);
}

// static/app/pages/shelters.js
function optionHtml(items, current) {
  return items.map(
    (item) => `<option value="${escapeHtml(item.value)}" ${current === item.value ? "selected" : ""}>${escapeHtml(item.label)}</option>`
  ).join("");
}
async function renderShelters(root, query) {
  setTitle("Shelters");
  const cityFromUrl = query.get("city") || "";
  if (cityFromUrl) setSelectedCity(cityFromUrl);
  const city = cityFromUrl || getSelectedCity();
  const params = {
    q: query.get("q") || "",
    city,
    area: query.get("area") || "",
    service: query.get("service") || "",
    emergency: query.get("emergency") || "",
    page: query.get("page") || "1"
  };
  const [meta, payload] = await Promise.all([
    getMeta(city ? { city } : {}),
    listShelters(params)
  ]);
  const shelters = payload.results || payload;
  const total = payload.count ?? shelters.length;
  const page = Number(params.page);
  const pageSize = 9;
  const numPages = payload.count ? Math.max(1, Math.ceil(payload.count / pageSize)) : 1;
  const heading = city ? `Dog shelters in ${cityLabel(city)}` : "Dog shelters in Hyderabad & Bangalore";
  const qs = (overrides = {}) => {
    const next = new URLSearchParams({
      q: params.q,
      city: params.city,
      area: params.area,
      service: params.service,
      emergency: params.emergency,
      page: String(page),
      ...overrides
    });
    ["q", "city", "area", "service", "emergency", "page"].forEach((key) => {
      if (!next.get(key)) next.delete(key);
    });
    const str = next.toString();
    return str ? `?${str}` : "";
  };
  root.innerHTML = `
    <section class="page-hero shell">
      <p class="eyebrow">Directory</p>
      <h1>${escapeHtml(heading)}</h1>
      <p class="lede">Pick a city, then filter by area or service \u2014 or show emergency rescue lines only.</p>
    </section>

    <section class="shell filters-wrap">
      <form class="filters" id="shelter-filters" role="search">
        <label class="field">
          <span>City</span>
          <select name="city" id="filter-city">
            <option value="">All cities</option>
            ${optionHtml(CITIES, params.city)}
          </select>
        </label>
        <label class="field grow">
          <span>Search</span>
          <input type="search" name="q" value="${escapeHtml(params.q)}" placeholder="Name, area, keyword\u2026">
        </label>
        <label class="field">
          <span>Area</span>
          <select name="area">
            <option value="">All areas</option>
            ${optionHtml(meta.areas || [], params.area)}
          </select>
        </label>
        <label class="field">
          <span>Service</span>
          <select name="service">
            <option value="">All services</option>
            ${optionHtml(meta.service_options, params.service)}
          </select>
        </label>
        <label class="check">
          <input type="checkbox" name="emergency" value="1" ${params.emergency === "1" ? "checked" : ""}>
          <span>Emergency only</span>
        </label>
        <button class="btn btn-primary" type="submit">Apply</button>
      </form>
      <p class="result-meta">${total} shelter${total === 1 ? "" : "s"} found</p>
    </section>

    <section class="section shell">
      <div class="shelter-grid">
        ${shelters.length ? shelters.map(shelterCard).join("") : `<p class="muted empty-state">No shelters match those filters. Try another city or clear search.</p>`}
      </div>
      ${numPages > 1 ? `<nav class="pagination" aria-label="Pagination">
              ${page > 1 ? `<a href="/shelters/${qs({ page: String(page - 1) })}" data-link>Previous</a>` : ""}
              <span>Page ${page} of ${numPages}</span>
              ${page < numPages ? `<a href="/shelters/${qs({ page: String(page + 1) })}" data-link>Next</a>` : ""}
            </nav>` : ""}
    </section>
  `;
  observeCards(root);
  const form = root.querySelector("#shelter-filters");
  const applyFilters = () => {
    const data = new FormData(form);
    const next = new URLSearchParams();
    const q = String(data.get("q") || "").trim();
    const nextCity = String(data.get("city") || "");
    const area = String(data.get("area") || "");
    const service = String(data.get("service") || "");
    if (q) next.set("q", q);
    if (nextCity) next.set("city", nextCity);
    if (area) next.set("area", area);
    if (service) next.set("service", service);
    if (data.get("emergency")) next.set("emergency", "1");
    setSelectedCity(nextCity);
    const path = `/shelters/${next.toString() ? `?${next}` : ""}`;
    history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  form?.querySelector("#filter-city")?.addEventListener("change", () => {
    const areaSelect = form.querySelector('select[name="area"]');
    if (areaSelect) areaSelect.value = "";
    applyFilters();
  });
}

// static/app/pages/detail.js
async function renderShelterDetail(root, slug) {
  let shelter;
  try {
    shelter = await getShelter(slug);
  } catch (err) {
    setTitle("Not found");
    root.innerHTML = errorHtml(
      err.status === 404 ? "That shelter was not found." : "Could not load this shelter."
    );
    return;
  }
  setTitle(shelter.name);
  const nearby = await getNearby(slug).catch(() => []);
  const tags = [
    shelter.emergency_rescue ? `<span class="tag tag-alert">Emergency rescue</span>` : "",
    ...(shelter.service_labels || []).map(
      (label) => `<span class="tag">${escapeHtml(label)}</span>`
    )
  ].join("");
  root.innerHTML = `
    <article class="detail">
      <header class="detail-hero">
        <div class="detail-hero-media" aria-hidden="true"></div>
        <div class="shell detail-hero-copy">
          <p class="eyebrow">${escapeHtml(
    [shelter.city_display, shelter.area_display].filter(Boolean).join(" \xB7 ")
  )}</p>
          <h1>${escapeHtml(shelter.name)}</h1>
          <p class="lede">${escapeHtml(shelter.short_description)}</p>
          <div class="tag-row">${tags}</div>
        </div>
      </header>

      <div class="shell detail-grid">
        <div class="detail-main prose">
          <h2>About</h2>
          <p>${escapeHtml(shelter.description)}</p>
          ${shelter.hours ? `<h2>Hours</h2><p>${escapeHtml(shelter.hours)}</p>` : ""}
        </div>

        <aside class="detail-aside">
          <div class="contact-panel">
            <h2>Contact</h2>
            <p class="contact-line">
              <span class="label">Phone</span>
              <a href="${telHref(shelter.phone)}">${escapeHtml(shelter.phone)}</a>
            </p>
            ${shelter.phone_secondary ? `<p class="contact-line">
                    <span class="label">Alt phone</span>
                    <a href="${telHref(shelter.phone_secondary)}">${escapeHtml(
    shelter.phone_secondary
  )}</a>
                  </p>` : ""}
            ${shelter.email ? `<p class="contact-line">
                    <span class="label">Email</span>
                    <a href="mailto:${escapeHtml(shelter.email)}">${escapeHtml(
    shelter.email
  )}</a>
                  </p>` : ""}
            ${shelter.website ? `<p class="contact-line">
                    <span class="label">Website</span>
                    <a href="${escapeHtml(
    shelter.website
  )}" target="_blank" rel="noopener">Visit site</a>
                  </p>` : ""}
            <p class="contact-line">
              <span class="label">Address</span>
              <span>${escapeHtml(shelter.address)}</span>
            </p>
            <div class="flag-row">
              ${shelter.accepts_volunteers ? `<span class="flag">Volunteers welcome</span>` : ""}
              ${shelter.accepts_donations ? `<span class="flag">Donations welcome</span>` : ""}
            </div>
            <a class="btn btn-primary btn-block" href="${telHref(
    shelter.phone
  )}">Call now</a>
          </div>
        </aside>
      </div>

      ${nearby.length ? `<section class="section section-tint">
              <div class="shell">
                <header class="section-head">
                  <h2>Nearby in ${escapeHtml(shelter.area_display)}</h2>
                </header>
                <div class="shelter-grid">
                  ${nearby.map(shelterCard).join("")}
                </div>
              </div>
            </section>` : ""}
    </article>
  `;
  observeCards(root);
}

// static/app/pages/content.js
var STATIC_PAGES = {
  "about-us": {
    title: "About Us",
    eyebrow: "About Us",
    heading: "A shared map of care across Hyderabad.",
    lede: "ScoobyHouse gathers public contacts for rescue NGOs, municipal ABC centres, and foster networks \u2014 so neighbours can act when a street dog needs help.",
    sections: [
      {
        heading: "Our mission",
        body: "We connect people who find street dogs in need with the shelters, rescuers, and NGOs already doing the work across Hyderabad."
      },
      {
        heading: "What we are not",
        body: "ScoobyHouse is not a shelter. We do not replace GHMC, PFA, Blue Cross, or any listed organisation. Always confirm hours and capacity before visiting."
      }
    ],
    cta: { label: "Browse shelters", href: "/shelters/" }
  },
  "our-work": {
    title: "Our Work",
    eyebrow: "Our Work",
    heading: "Making shelter help easier to find.",
    lede: "We maintain a living directory of rescue homes, ABC programmes, adoption NGOs, and emergency response teams in Hyderabad.",
    sections: [
      {
        heading: "Directory",
        body: "Verified public listings with phone numbers, areas served, and services \u2014 searchable by neighbourhood and need."
      },
      {
        heading: "Emergency pathways",
        body: "Groups that answer after-hours rescue calls are flagged so you can reach the right team when minutes matter."
      },
      {
        heading: "Community updates",
        body: "Listings are updated as organisations share new contacts, services, or capacity. Know a shelter we missed? Tell us."
      }
    ],
    cta: { label: "See our directory", href: "/shelters/" }
  },
  "get-involved": {
    title: "Get Involved",
    eyebrow: "Get Involved",
    heading: "Many ways to help Hyderabad\u2019s street dogs.",
    lede: "You do not need to run a shelter to make a difference. Start where you are.",
    sections: [
      {
        heading: "Volunteer",
        body: "Walk dogs, help with feeding rounds, transport to clinics, or support adoption events at a shelter near you."
      },
      {
        heading: "Foster",
        body: "Short-term foster homes free up shelter space for the next rescue and give dogs a calmer place to heal."
      },
      {
        heading: "Share listings",
        body: "Send ScoobyHouse to neighbours, housing societies, and local groups so more people know whom to call."
      }
    ],
    cta: { label: "Find a shelter to support", href: "/shelters/" }
  },
  donate: {
    title: "Donate",
    eyebrow: "Donate",
    heading: "Support the teams on the ground.",
    lede: "Shelters and NGOs rely on donations for food, medicine, sterilisation camps, and emergency care.",
    sections: [],
    useDonateForm: true
  },
  csr: {
    title: "CSR",
    eyebrow: "CSR",
    heading: "Corporate partnerships for animal welfare.",
    lede: "Companies in Hyderabad can sponsor sterilisation drives, shelter infrastructure, or employee volunteer days.",
    sections: [
      {
        heading: "Partnership models",
        body: "Fund ABC camps in a chosen area, donate monthly food supplies, or match employee giving to verified NGOs."
      },
      {
        heading: "Impact reporting",
        body: "We connect you with shelter partners who can share outcomes \u2014 dogs treated, sterilised, and rehomed."
      }
    ],
    cta: { label: "Contact us", href: "/contact/" }
  },
  faqs: {
    title: "FAQs",
    eyebrow: "FAQs",
    heading: "Common questions.",
    lede: "Quick answers about ScoobyHouse and how to use the directory.",
    sections: [
      {
        heading: "Is ScoobyHouse a shelter?",
        body: "No. We are a directory. Always contact the listed organisation directly for rescue, adoption, or surrender."
      },
      {
        heading: "How do I report an injured dog?",
        body: "Open the shelter directory, filter for emergency rescue if needed, and call the nearest listed team. Share location and what you see."
      },
      {
        heading: "How accurate are listings?",
        body: "Details come from public sources and partner updates. Phone numbers and hours can change \u2014 confirm before visiting."
      },
      {
        heading: "Can I add a shelter?",
        body: "Yes. Reach out via Contact or use the admin listing flow if you manage shelter data."
      }
    ],
    cta: { label: "Browse shelters", href: "/shelters/" }
  },
  contact: {
    title: "Contact",
    eyebrow: "Contact",
    heading: "Get in touch.",
    lede: "Questions about the directory, partnership enquiries, or corrections to a listing.",
    sections: [
      {
        heading: "Directory updates",
        body: "Email or message us with the shelter name, corrected phone number, area, and services offered."
      },
      {
        heading: "CSR & partnerships",
        body: "For corporate social responsibility enquiries, use the subject line \u201CCSR\u201D and we will connect you with the right team."
      },
      {
        heading: "General",
        body: "For urgent animal rescue, please call a listed shelter directly \u2014 ScoobyHouse does not operate a rescue helpline."
      }
    ],
    cta: { label: "View shelters", href: "/shelters/" }
  }
};

// static/app/pages/donate.js
var PURPOSE_OPTIONS = [
  { value: "general", label: "General fund" },
  { value: "emergency", label: "Emergency rescue" },
  { value: "abc", label: "ABC / sterilisation" },
  { value: "food_medicine", label: "Food & medicine" },
  { value: "shelter", label: "Shelter upkeep" }
];
var PRESETS = [500, 1e3, 2e3, 5e3];
var MIN_AMOUNT = 100;
function presetButtons() {
  return PRESETS.map(
    (amount) => `<button type="button" class="amount-preset" data-amount="${amount}">\u20B9${amount.toLocaleString("en-IN")}</button>`
  ).join("");
}
function showMessage(root, type, text) {
  const box = root.querySelector("#donate-message");
  if (!box) return;
  if (!text) {
    box.hidden = true;
    box.textContent = "";
    return;
  }
  box.hidden = false;
  box.className = `donate-message donate-message-${type}`;
  box.textContent = text;
}
function bindDonateForm(root) {
  const form = root.querySelector("#donate-form");
  const amountInput = root.querySelector("#donor-amount");
  const submitBtn = root.querySelector("#donate-submit");
  if (!form || !amountInput || !submitBtn) return;
  root.querySelector("#amount-presets")?.addEventListener("click", (event) => {
    const btn = event.target.closest(".amount-preset");
    if (!btn) return;
    amountInput.value = btn.dataset.amount;
    root.querySelectorAll(".amount-preset").forEach((el) => el.classList.remove("is-selected"));
    btn.classList.add("is-selected");
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage(root, "info", "");
    const formData = new FormData(form);
    if (!formData.get("consent")) {
      showMessage(root, "error", "Please accept the consent checkbox to continue.");
      return;
    }
    const payload = {
      full_name: String(formData.get("full_name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      purpose: String(formData.get("purpose") || "general"),
      amount: Number(formData.get("amount")),
      pan: String(formData.get("pan") || "").trim(),
      message: String(formData.get("message") || "").trim()
    };
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing\u2026";
    try {
      const result = await submitDonation(payload);
      showMessage(root, "success", result.message);
      form.reset();
      root.querySelectorAll(".amount-preset").forEach((el) => el.classList.remove("is-selected"));
    } catch (err) {
      showMessage(root, "error", err.message || "Could not submit your donation. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Make Payment";
    }
  });
}
function renderDonate(root) {
  setTitle("Donate");
  root.innerHTML = `
    <section class="page-hero shell">
      <p class="eyebrow">Donate</p>
      <h1>Support Hyderabad\u2019s street dogs.</h1>
      <p class="lede">Your contribution helps shelters fund rescue, food, medicine, and sterilisation camps across the city.</p>
    </section>

    <section class="section shell donate-section">
      <div class="donate-layout">
        <div class="donate-info prose">
          <h2>What your gift supports</h2>
          <p>Rescue transport, wound care, ABC surgeries, puppy food, kennel upkeep, and volunteer coordination.</p>
          <ul class="donate-points">
            <li>Choose where your donation is directed</li>
            <li>Fill in your details below</li>
            <li>Our team will follow up with payment instructions</li>
          </ul>
        </div>

        <form class="donate-form" id="donate-form" novalidate>
          <div id="donate-message" class="donate-message" hidden></div>

          <div class="field">
            <label for="donor-name"><span>Full name</span></label>
            <input id="donor-name" name="full_name" type="text" autocomplete="name" required maxlength="120" placeholder="Your full name">
          </div>

          <div class="field-row">
            <div class="field grow">
              <label for="donor-email"><span>Email</span></label>
              <input id="donor-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
            </div>
            <div class="field grow">
              <label for="donor-phone"><span>Phone</span></label>
              <input id="donor-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+91 98765 43210">
            </div>
          </div>

          <div class="field">
            <label for="donor-purpose"><span>Donation purpose</span></label>
            <select id="donor-purpose" name="purpose" required>
              ${PURPOSE_OPTIONS.map((o) => `<option value="${o.value}">${escapeHtml(o.label)}</option>`).join("")}
            </select>
          </div>

          <div class="field">
            <span class="field-label">Amount (INR)</span>
            <div class="amount-presets" id="amount-presets">${presetButtons()}</div>
            <label for="donor-amount"><span>Custom amount</span></label>
            <input id="donor-amount" name="amount" type="number" min="${MIN_AMOUNT}" step="1" required placeholder="Min \u20B9${MIN_AMOUNT}">
          </div>

          <div class="field-row">
            <div class="field grow">
              <label for="donor-pan"><span>PAN (optional)</span></label>
              <input id="donor-pan" name="pan" type="text" maxlength="10" placeholder="For 80G receipt">
            </div>
          </div>

          <div class="field">
            <label for="donor-note"><span>Message (optional)</span></label>
            <textarea id="donor-note" name="message" rows="3" maxlength="500" placeholder="Dedicate your gift or leave a note"></textarea>
          </div>

          <label class="check donate-consent">
            <input type="checkbox" id="donor-consent" name="consent" required>
            <span>I agree to ScoobyHouse using my details to process this donation and send a receipt.</span>
          </label>

          <button type="submit" class="btn btn-primary btn-block" id="donate-submit">
            Make Payment
          </button>

          <p class="muted small donate-note">Fill in your details and click Make Payment. We\u2019ll confirm your donation shortly.</p>
        </form>
      </div>
    </section>
  `;
  bindDonateForm(root);
}

// static/app/pages/staticPage.js
async function renderStaticPage(root, slug) {
  if (slug === "donate") {
    renderDonate(root);
    return true;
  }
  const page = STATIC_PAGES[slug];
  if (!page) return false;
  setTitle(page.title);
  const sections = (page.sections || []).map(
    (section) => `
        <h2>${section.heading}</h2>
        <p>${section.body}</p>
      `
  ).join("");
  const cta = page.cta ? `<p><a class="btn btn-primary" href="${page.cta.href}" data-link>${page.cta.label}</a></p>` : "";
  root.innerHTML = `
    <section class="page-hero shell">
      <p class="eyebrow">${page.eyebrow}</p>
      <h1>${page.heading}</h1>
      <p class="lede">${page.lede}</p>
    </section>
    <section class="section shell prose">
      ${sections}
      ${cta}
    </section>
  `;
  return true;
}

// static/app/pages/auth.js
function showMessage2(root, type, text) {
  const box = root.querySelector("#auth-message");
  if (!box) return;
  if (!text) {
    box.hidden = true;
    box.textContent = "";
    box.className = "auth-message";
    return;
  }
  box.hidden = false;
  box.className = `auth-message auth-message-${type}`;
  box.textContent = text;
}
function authShell({ title, heading, lede, formHtml, altHtml, panelTitle, panelLede }) {
  return `
    <div class="auth-page shell">
      <div class="auth-split" role="presentation">
        <aside class="auth-panel">
          <div class="auth-panel-copy">
            <p class="auth-panel-eyebrow">ScoobyHouse</p>
            <h2 class="auth-panel-title">${escapeHtml(panelTitle)}</h2>
            <p class="auth-panel-lede">${escapeHtml(panelLede)}</p>
          </div>
        </aside>
        <div class="auth-card">
          <h1 class="auth-card-title">${escapeHtml(heading)}</h1>
          <p class="auth-card-lede muted">${escapeHtml(lede)}</p>
          <h2 class="auth-card-heading">${escapeHtml(title)}</h2>
          <div id="auth-message" class="auth-message" hidden></div>
          ${formHtml}
          <p class="auth-alt muted">${altHtml}</p>
        </div>
      </div>
    </div>
  `;
}
function phoneStepHtml({ includeName = false, submitLabel = "Continue" } = {}) {
  return `
    <form class="auth-form" id="otp-phone-form">
      ${includeName ? `<label class="field">
              <span class="field-label">Full name</span>
              <input type="text" name="full_name" required autocomplete="name" placeholder="Your name">
            </label>` : ""}
      <label class="field">
        <span class="field-label">Mobile number</span>
        <div class="phone-input">
          <span class="phone-prefix" aria-hidden="true">+91</span>
          <input
            type="tel"
            name="phone"
            required
            inputmode="numeric"
            autocomplete="tel-national"
            maxlength="10"
            pattern="[6-9][0-9]{9}"
            placeholder="10-digit mobile"
            aria-label="10-digit mobile number"
          >
        </div>
      </label>
      <button class="btn btn-primary" type="submit" id="auth-submit">${escapeHtml(submitLabel)}</button>
    </form>
  `;
}
function otpStepHtml({ phoneDisplay, submitLabel = "Verify & continue" }) {
  return `
    <form class="auth-form" id="otp-verify-form">
      <p class="otp-sent muted">OTP sent to <strong>${escapeHtml(phoneDisplay)}</strong></p>
      <label class="field">
        <span class="field-label">Enter OTP</span>
        <input
          type="text"
          name="otp"
          required
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          pattern="[0-9]{6}"
          placeholder="6-digit OTP"
          class="otp-input"
          aria-label="6-digit OTP"
        >
      </label>
      <button class="btn btn-primary" type="submit" id="auth-submit">${escapeHtml(submitLabel)}</button>
      <div class="otp-actions">
        <button type="button" class="linkish" id="otp-change-phone">Change number</button>
        <button type="button" class="linkish" id="otp-resend" disabled>Resend OTP</button>
      </div>
    </form>
  `;
}
function goHomeSoon() {
  setTimeout(() => {
    history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, 450);
}
function bindOtpFlow(root, { includeName = false, heading, title, lede, panelTitle, panelLede, altHtml }) {
  let phone = "";
  let fullName = "";
  let resendTimer = null;
  let resendLeft = 0;
  function clearResendTimer() {
    if (resendTimer) {
      window.clearInterval(resendTimer);
      resendTimer = null;
    }
  }
  function startResendCountdown(seconds) {
    clearResendTimer();
    resendLeft = seconds;
    const btn = root.querySelector("#otp-resend");
    if (!btn) return;
    const tick = () => {
      if (resendLeft <= 0) {
        btn.disabled = false;
        btn.textContent = "Resend OTP";
        clearResendTimer();
        return;
      }
      btn.disabled = true;
      btn.textContent = `Resend in ${resendLeft}s`;
      resendLeft -= 1;
    };
    tick();
    resendTimer = window.setInterval(tick, 1e3);
  }
  function renderPhoneStep() {
    clearResendTimer();
    root.innerHTML = authShell({
      title,
      heading,
      lede,
      panelTitle,
      panelLede,
      altHtml,
      formHtml: phoneStepHtml({
        includeName,
        submitLabel: "Request OTP"
      })
    });
    const form = root.querySelector("#otp-phone-form");
    const submitBtn = root.querySelector("#auth-submit");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage2(root, "info", "");
      const data = new FormData(form);
      const nextPhone = String(data.get("phone") || "").replace(/\D/g, "");
      const nextName = includeName ? String(data.get("full_name") || "").trim() : "";
      if (includeName && !nextName) {
        showMessage2(root, "error", "Please enter your name.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(nextPhone)) {
        showMessage2(root, "error", "Enter a valid 10-digit Indian mobile number.");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending OTP\u2026";
      try {
        const payload = { phone: nextPhone };
        if (nextName) payload.full_name = nextName;
        const result = await requestOtp(payload);
        phone = nextPhone;
        fullName = nextName;
        renderOtpStep(result);
      } catch (err) {
        showMessage2(root, "error", err.message || "Could not send OTP.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Request OTP";
      }
    });
  }
  function renderOtpStep(requestResult) {
    const phoneDisplay = requestResult.phone_display || `+91 ${phone}`;
    root.innerHTML = authShell({
      title: "Verify OTP",
      heading,
      lede: "Enter the 6-digit code sent to your mobile.",
      panelTitle,
      panelLede,
      altHtml,
      formHtml: otpStepHtml({ phoneDisplay })
    });
    if (requestResult.debug_otp) {
      showMessage2(root, "info", `Dev OTP: ${requestResult.debug_otp} (SMS not configured)`);
    } else {
      showMessage2(root, "success", requestResult.message || "OTP sent.");
    }
    startResendCountdown(requestResult.resend_in || 30);
    const form = root.querySelector("#otp-verify-form");
    const submitBtn = root.querySelector("#auth-submit");
    const otpInput = root.querySelector('input[name="otp"]');
    otpInput?.focus();
    root.querySelector("#otp-change-phone")?.addEventListener("click", () => {
      renderPhoneStep();
    });
    root.querySelector("#otp-resend")?.addEventListener("click", async () => {
      const btn = root.querySelector("#otp-resend");
      if (!btn || btn.disabled) return;
      btn.disabled = true;
      try {
        const payload = { phone };
        if (fullName) payload.full_name = fullName;
        const result = await requestOtp(payload);
        if (result.debug_otp) {
          showMessage2(root, "info", `Dev OTP: ${result.debug_otp} (SMS not configured)`);
        } else {
          showMessage2(root, "success", result.message || "OTP resent.");
        }
        startResendCountdown(result.resend_in || 30);
        otpInput.value = "";
        otpInput.focus();
      } catch (err) {
        showMessage2(root, "error", err.message || "Could not resend OTP.");
        btn.disabled = false;
        btn.textContent = "Resend OTP";
      }
    });
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const otp = String(data.get("otp") || "").replace(/\D/g, "");
      if (otp.length !== 6) {
        showMessage2(root, "error", "Enter the 6-digit OTP.");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Verifying\u2026";
      try {
        const payload = { phone, otp };
        if (fullName) payload.full_name = fullName;
        await verifyOtp(payload);
        showMessage2(root, "success", "Signed in. Taking you home\u2026");
        window.dispatchEvent(new CustomEvent("auth:changed"));
        clearResendTimer();
        goHomeSoon();
      } catch (err) {
        showMessage2(root, "error", err.message || "Could not verify OTP.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Verify & continue";
      }
    });
  }
  renderPhoneStep();
}
async function renderLogin(root) {
  setTitle("Log in");
  bindOtpFlow(root, {
    includeName: false,
    heading: "Log in",
    title: "Enter mobile number",
    lede: "We\u2019ll send a one-time password (OTP) to verify your number.",
    panelTitle: "Find help for every good dog",
    panelLede: "Log in with your mobile number \u2014 no password needed.",
    altHtml: `New here? <a href="/signup/" data-link>Create an account</a>`
  });
}
async function renderSignup(root) {
  setTitle("Sign up");
  bindOtpFlow(root, {
    includeName: true,
    heading: "Sign up",
    title: "Create your account",
    lede: "Add your name and mobile number. We\u2019ll verify with an OTP.",
    panelTitle: "Join the pack",
    panelLede: "Sign up with OTP and stay close to shelters that need you.",
    altHtml: `Already have an account? <a href="/login/" data-link>Log in</a>`
  });
}

// static/app/main.js
var app = document.getElementById("app");
var STATIC_ROUTES = Object.fromEntries(
  Object.keys(STATIC_PAGES).map((slug) => [`/${slug}/`, slug])
);
function matchRoute(pathname) {
  if (pathname === "/" || pathname === "") {
    return { name: "home" };
  }
  if (pathname === "/about" || pathname === "/about/") {
    return { name: "static", slug: "about-us" };
  }
  if (pathname === "/login" || pathname === "/login/") {
    return { name: "login" };
  }
  if (pathname === "/signup" || pathname === "/signup/") {
    return { name: "signup" };
  }
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (STATIC_ROUTES[normalized]) {
    return { name: "static", slug: STATIC_ROUTES[normalized] };
  }
  if (pathname === "/shelters" || pathname === "/shelters/") {
    return { name: "shelters" };
  }
  const detail = pathname.match(/^\/shelters\/([^/]+)\/?$/);
  if (detail) {
    return { name: "detail", slug: decodeURIComponent(detail[1]) };
  }
  return { name: "notfound" };
}
var renderToken = 0;
async function render() {
  const token = ++renderToken;
  const route = matchRoute(window.location.pathname);
  const query = new URLSearchParams(window.location.search);
  syncHeaderCity(query.get("city") || getSelectedCity());
  refreshHeaderAuth().catch((err) => console.error(err));
  if (!app) return;
  app.innerHTML = loadingHtml();
  try {
    if (route.name === "home") {
      await renderHome(app);
    } else if (route.name === "static") {
      if (!await renderStaticPage(app, route.slug)) {
        app.innerHTML = errorHtml("Page not found.");
      }
    } else if (route.name === "shelters") {
      await renderShelters(app, query);
    } else if (route.name === "detail") {
      await renderShelterDetail(app, route.slug);
    } else if (route.name === "login") {
      await renderLogin(app);
    } else if (route.name === "signup") {
      await renderSignup(app);
    } else {
      app.innerHTML = errorHtml("Page not found.");
    }
  } catch (err) {
    console.error(err);
    if (token === renderToken) {
      app.innerHTML = errorHtml(err.message || "Could not load this page. Is the API running?");
    }
    return;
  }
  if (token !== renderToken) return;
  updateNavActive(route);
  try {
    window.scrollTo(0, 0);
  } catch {
  }
}
function updateNavActive(route) {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".site-nav a[data-link]").forEach((link) => {
    const href = link.getAttribute("href").replace(/\/$/, "") || "/";
    const isHome = href === "/" && path === "/";
    const isMatch = isHome || href !== "/" && path === href;
    link.classList.toggle("is-active", isMatch);
  });
}
function syncHeaderCity(city) {
  const select = document.getElementById("header-city");
  if (select) select.value = city || "";
}
async function refreshHeaderAuth() {
  const mount = document.getElementById("header-auth");
  if (!mount) return;
  try {
    const data = await getMe();
    if (data.authenticated && data.user) {
      const name = escapeHtml(data.user.full_name || data.user.phone_display || data.user.phone);
      const tip = escapeHtml(data.user.phone_display || data.user.phone || "");
      mount.innerHTML = `
        <span class="auth-user" title="${tip}">${name}</span>
        <button type="button" class="nav-cta nav-cta-outline" id="header-logout">Log out</button>
      `;
      mount.querySelector("#header-logout")?.addEventListener("click", async () => {
        try {
          await logout();
        } catch (err) {
          console.error(err);
        }
        window.dispatchEvent(new CustomEvent("auth:changed"));
        history.pushState({}, "", "/");
        render();
      });
      return;
    }
  } catch (err) {
    console.error(err);
  }
  mount.innerHTML = `
    <a class="nav-cta nav-cta-outline" href="/login/" data-link>Log in</a>
    <a class="nav-cta" href="/signup/" data-link>Sign up</a>
  `;
}
function initHeaderCity() {
  const select = document.getElementById("header-city");
  if (!select || select.dataset.bound) return;
  select.dataset.bound = "true";
  select.value = getSelectedCity();
  select.addEventListener("change", () => {
    const city = select.value;
    setSelectedCity(city);
    const next = new URLSearchParams();
    if (city) next.set("city", city);
    const path = `/shelters/${next.toString() ? `?${next}` : ""}`;
    history.pushState({}, "", path);
    render();
  });
}
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-link]");
  if (!link) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target && link.target !== "_self") return;
  const url = new URL(link.href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  event.preventDefault();
  if (url.pathname + url.search !== window.location.pathname + window.location.search) {
    history.pushState({}, "", url.pathname + url.search);
  }
  render();
});
window.addEventListener("popstate", render);
window.addEventListener("auth:changed", () => {
  refreshHeaderAuth().catch((err) => console.error(err));
});
function initHeaderSearch() {
  const form = document.getElementById("header-search");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = new FormData(form).get("q");
    const term = String(q || "").trim();
    const next = new URLSearchParams();
    const city = getSelectedCity();
    if (city) next.set("city", city);
    if (term) next.set("q", term);
    const path = `/shelters/${next.toString() ? `?${next}` : ""}`;
    history.pushState({}, "", path);
    render();
    form.querySelector(".site-search-input")?.blur();
  });
}
initHeaderCity();
initHeaderSearch();
document.documentElement.classList.add("js");
render().catch((err) => {
  console.error(err);
  if (app) {
    app.innerHTML = errorHtml(err.message || "Could not start ScoobyHouse.");
  }
});
