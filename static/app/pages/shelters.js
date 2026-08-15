import { getMeta, listShelters } from "../api.js";
import { shelterCard, observeCards } from "../components/shelterCard.js";
import {
  CITIES,
  cityLabel,
  getSelectedCity,
  setSelectedCity,
} from "../city.js";
import { escapeHtml, setTitle } from "../utils.js";

function optionHtml(items, current) {
  return items
    .map(
      (item) =>
        `<option value="${escapeHtml(item.value)}" ${
          current === item.value ? "selected" : ""
        }>${escapeHtml(item.label)}</option>`
    )
    .join("");
}

export async function renderShelters(root, query) {
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
    page: query.get("page") || "1",
  };

  const [meta, payload] = await Promise.all([
    getMeta(city ? { city } : {}),
    listShelters(params),
  ]);
  const shelters = payload.results || payload;
  const total = payload.count ?? shelters.length;
  const page = Number(params.page);
  const pageSize = 9;
  const numPages = payload.count ? Math.max(1, Math.ceil(payload.count / pageSize)) : 1;
  const heading = city
    ? `Dog shelters in ${cityLabel(city)}`
    : "Dog shelters in Hyderabad & Bangalore";

  const qs = (overrides = {}) => {
    const next = new URLSearchParams({
      q: params.q,
      city: params.city,
      area: params.area,
      service: params.service,
      emergency: params.emergency,
      page: String(page),
      ...overrides,
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
      <p class="lede">Pick a city, then filter by area or service — or show emergency rescue lines only.</p>
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
          <input type="search" name="q" value="${escapeHtml(params.q)}" placeholder="Name, area, keyword…">
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
          <input type="checkbox" name="emergency" value="1" ${
            params.emergency === "1" ? "checked" : ""
          }>
          <span>Emergency only</span>
        </label>
        <button class="btn btn-primary" type="submit">Apply</button>
      </form>
      <p class="result-meta">${total} shelter${total === 1 ? "" : "s"} found</p>
    </section>

    <section class="section shell">
      <div class="shelter-grid">
        ${
          shelters.length
            ? shelters.map(shelterCard).join("")
            : `<p class="muted empty-state">No shelters match those filters. Try another city or clear search.</p>`
        }
      </div>
      ${
        numPages > 1
          ? `<nav class="pagination" aria-label="Pagination">
              ${
                page > 1
                  ? `<a href="/shelters/${qs({ page: String(page - 1) })}" data-link>Previous</a>`
                  : ""
              }
              <span>Page ${page} of ${numPages}</span>
              ${
                page < numPages
                  ? `<a href="/shelters/${qs({ page: String(page + 1) })}" data-link>Next</a>`
                  : ""
              }
            </nav>`
          : ""
      }
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
    // Reset area when city changes — areas are city-specific
    const areaSelect = form.querySelector('select[name="area"]');
    if (areaSelect) areaSelect.value = "";
    applyFilters();
  });
}
