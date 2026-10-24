import { getMeta, listShelters } from "../api.js";
import { shelterCard, observeCards } from "../components/shelterCard.js";
import { logoMarkup } from "../components/logo.js";
import { CITIES } from "../city.js";
import { setTitle } from "../utils.js";

const HERO_SLIDES = [
  {
    src: "/static/img/hero-farm-dog.jpg?v=1",
    alt: "Indie dog standing on a farm ledge looking at the camera",
    position: "72% 45%",
  },
  {
    src: "/static/img/hero-beach-dogs.jpg?v=1",
    alt: "Street dogs on a sandy beach with palms behind them",
    position: "70% 55%",
  },
  {
    src: "/static/img/hero-sidewalk-dog.jpg?v=1",
    alt: "Indie dog resting on a sunlit sidewalk",
    position: "68% 60%",
  },
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

export async function renderHome(root) {
  setTitle("Home");
  const [meta, featuredPayload] = await Promise.all([
    getMeta(),
    listShelters({ featured: "1", page_size: 3 }),
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
        <h1>Find the right shelter in Hyderabad or Bangalore — fast.</h1>
        <p class="lede">One calm directory for rescue homes, ABC centres, and adoption NGOs across both cities.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="/shelters/?city=hyderabad" data-link>Hyderabad shelters</a>
          <a class="btn btn-ghost" href="/shelters/?city=bangalore" data-link>Bangalore shelters</a>
        </div>
        <div class="city-chip-row" aria-label="Cities">
          ${CITIES.map(
            (c) =>
              `<a class="city-chip" href="/shelters/?city=${c.value}" data-link>${c.label}</a>`
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
        <p>Search by neighbourhood, service, or emergency need — then call the right team.</p>
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
          <p>Rescue, ABC, adoption, foster, or cruelty response — clear at a glance.</p>
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
