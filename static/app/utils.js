export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, "")}`;
}

export function serviceLabels(labels = []) {
  return labels
    .slice(0, 3)
    .map((label) => `<li>${escapeHtml(label)}</li>`)
    .join("");
}

export function setTitle(page) {
  document.title = page ? `${page} · ScoobyHouse` : "ScoobyHouse · Hyderabad dog shelters";
}

export function loadingHtml(message = "Loading…") {
  return `<div class="shell loading-state"><p class="muted">${escapeHtml(message)}</p></div>`;
}

export function errorHtml(message) {
  return `
    <section class="page-hero shell">
      <h1>Something went wrong</h1>
      <p class="lede">${escapeHtml(message)}</p>
      <p><a class="btn btn-primary" href="/" data-link>Back home</a></p>
    </section>
  `;
}
