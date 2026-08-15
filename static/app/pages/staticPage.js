import { STATIC_PAGES } from "./content.js";
import { setTitle } from "../utils.js";
import { renderDonate } from "./donate.js";

export async function renderStaticPage(root, slug) {
  if (slug === "donate") {
    renderDonate(root);
    return true;
  }

  const page = STATIC_PAGES[slug];
  if (!page) return false;

  setTitle(page.title);

  const sections = (page.sections || [])
    .map(
      (section) => `
        <h2>${section.heading}</h2>
        <p>${section.body}</p>
      `
    )
    .join("");

  const cta = page.cta
    ? `<p><a class="btn btn-primary" href="${page.cta.href}" data-link>${page.cta.label}</a></p>`
    : "";

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
