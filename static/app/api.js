const API_BASE = "/api";

function csrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function ensureCsrf() {
  if (csrfToken()) return;
  await fetch(`${API_BASE}/auth/csrf/`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs || 10000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(options.headers || {}) },
      body: options.body,
      signal: controller.signal,
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

export function getMeta(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length) {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return request(`/meta/${qs ? `?${qs}` : ""}`);
}

export function listShelters(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length) {
      query.set(key, value);
    }
  });
  const qs = query.toString();
  return request(`/shelters/${qs ? `?${qs}` : ""}`);
}

export function getShelter(slug) {
  return request(`/shelters/${encodeURIComponent(slug)}/`);
}

export function getNearby(slug) {
  return request(`/shelters/${encodeURIComponent(slug)}/nearby/`);
}

export function submitDonation(payload) {
  return postJson("/donations/submit/", payload);
}

export function getMe() {
  return request("/auth/me/");
}

export function requestOtp(payload) {
  return postJson("/auth/request-otp/", payload);
}

export function verifyOtp(payload) {
  return postJson("/auth/verify-otp/", payload);
}

export function logout() {
  return postJson("/auth/logout/", {});
}

async function postJson(path, payload) {
  await ensureCsrf();
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token = csrfToken();
  if (token) headers["X-CSRFToken"] = token;

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = data.detail;
    if (!message && typeof data === "object") {
      message = Object.entries(data)
        .map(([key, value]) => {
          const label = Array.isArray(value) ? value.join(", ") : String(value);
          return `${key}: ${label}`;
        })
        .join("; ");
    }
    const error = new Error(message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
