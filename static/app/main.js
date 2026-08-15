import { renderHome } from "./pages/home.js";
import { renderShelters } from "./pages/shelters.js";
import { renderShelterDetail } from "./pages/detail.js";
import { renderStaticPage } from "./pages/staticPage.js";
import { renderLogin, renderSignup } from "./pages/auth.js";
import { STATIC_PAGES } from "./pages/content.js";
import { getMe, logout } from "./api.js";
import { getSelectedCity, setSelectedCity } from "./city.js";
import { escapeHtml, errorHtml, loadingHtml } from "./utils.js";

const app = document.getElementById("app");

const STATIC_ROUTES = Object.fromEntries(
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

let renderToken = 0;

async function render() {
  const token = ++renderToken;
  const route = matchRoute(window.location.pathname);
  const query = new URLSearchParams(window.location.search);

  syncHeaderCity(query.get("city") || getSelectedCity());

  // Never block page content on auth header refresh
  refreshHeaderAuth().catch((err) => console.error(err));

  if (!app) return;
  app.innerHTML = loadingHtml();

  try {
    if (route.name === "home") {
      await renderHome(app);
    } else if (route.name === "static") {
      if (!(await renderStaticPage(app, route.slug))) {
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
    /* ignore */
  }
}

function updateNavActive(route) {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".site-nav a[data-link]").forEach((link) => {
    const href = link.getAttribute("href").replace(/\/$/, "") || "/";
    const isHome = href === "/" && path === "/";
    const isMatch = isHome || (href !== "/" && path === href);
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
