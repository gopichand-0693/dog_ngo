import { getNearby, getShelter } from "../api.js";
import { shelterCard, observeCards } from "../components/shelterCard.js";
import { escapeHtml, errorHtml, setTitle, telHref } from "../utils.js";

export async function renderShelterDetail(root, slug) {
  let shelter;
  try {
    shelter = await getShelter(slug);
  } catch (err) {
    setTitle("Not found");
    root.innerHTML = errorHtml(
      err.status === 404
        ? "That shelter was not found."
        : "Could not load this shelter."
    );
    return;
  }

  setTitle(shelter.name);
  const nearby = await getNearby(slug).catch(() => []);

  const tags = [
    shelter.emergency_rescue
      ? `<span class="tag tag-alert">Emergency rescue</span>`
      : "",
    ...(shelter.service_labels || []).map(
      (label) => `<span class="tag">${escapeHtml(label)}</span>`
    ),
  ].join("");

  root.innerHTML = `
    <article class="detail">
      <header class="detail-hero">
        <div class="detail-hero-media" aria-hidden="true"></div>
        <div class="shell detail-hero-copy">
          <p class="eyebrow">${escapeHtml(
            [shelter.city_display, shelter.area_display].filter(Boolean).join(" · ")
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
          ${
            shelter.hours
              ? `<h2>Hours</h2><p>${escapeHtml(shelter.hours)}</p>`
              : ""
          }
        </div>

        <aside class="detail-aside">
          <div class="contact-panel">
            <h2>Contact</h2>
            <p class="contact-line">
              <span class="label">Phone</span>
              <a href="${telHref(shelter.phone)}">${escapeHtml(shelter.phone)}</a>
            </p>
            ${
              shelter.phone_secondary
                ? `<p class="contact-line">
                    <span class="label">Alt phone</span>
                    <a href="${telHref(shelter.phone_secondary)}">${escapeHtml(
                      shelter.phone_secondary
                    )}</a>
                  </p>`
                : ""
            }
            ${
              shelter.email
                ? `<p class="contact-line">
                    <span class="label">Email</span>
                    <a href="mailto:${escapeHtml(shelter.email)}">${escapeHtml(
                      shelter.email
                    )}</a>
                  </p>`
                : ""
            }
            ${
              shelter.website
                ? `<p class="contact-line">
                    <span class="label">Website</span>
                    <a href="${escapeHtml(
                      shelter.website
                    )}" target="_blank" rel="noopener">Visit site</a>
                  </p>`
                : ""
            }
            <p class="contact-line">
              <span class="label">Address</span>
              <span>${escapeHtml(shelter.address)}</span>
            </p>
            <div class="flag-row">
              ${
                shelter.accepts_volunteers
                  ? `<span class="flag">Volunteers welcome</span>`
                  : ""
              }
              ${
                shelter.accepts_donations
                  ? `<span class="flag">Donations welcome</span>`
                  : ""
              }
            </div>
            <a class="btn btn-primary btn-block" href="${telHref(
              shelter.phone
            )}">Call now</a>
          </div>
        </aside>
      </div>

      ${
        nearby.length
          ? `<section class="section section-tint">
              <div class="shell">
                <header class="section-head">
                  <h2>Nearby in ${escapeHtml(shelter.area_display)}</h2>
                </header>
                <div class="shelter-grid">
                  ${nearby.map(shelterCard).join("")}
                </div>
              </div>
            </section>`
          : ""
      }
    </article>
  `;

  observeCards(root);
}
