import { escapeHtml } from "../utils.js";

export function shelterCard(shelter) {
  const emergency = shelter.emergency_rescue
    ? `<span class="pill">Emergency</span>`
    : "";
  const services = (shelter.service_labels || []).slice(0, 3).join(" · ");
  const place = [shelter.city_display, shelter.area_display]
    .filter(Boolean)
    .join(" · ");

  return `
    <a class="shelter-card" href="${escapeHtml(shelter.url)}" data-link>
      <div class="shelter-card-top">
        <p class="area">${escapeHtml(place)}</p>
        ${emergency}
      </div>
      <h3>${escapeHtml(shelter.name)}</h3>
      <p>${escapeHtml(shelter.short_description)}</p>
      ${
        services
          ? `<p class="service-line">${escapeHtml(services)}</p>`
          : ""
      }
      <span class="card-link">View details <span aria-hidden="true">→</span></span>
    </a>
  `;
}

export function observeCards(root) {
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
