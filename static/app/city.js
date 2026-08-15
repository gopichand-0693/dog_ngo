/** City preference helpers for Hyderabad / Bangalore. */

const CITY_KEY = "scooby_city";

export const CITIES = [
  { value: "hyderabad", label: "Hyderabad" },
  { value: "bangalore", label: "Bangalore" },
];

export function getSelectedCity() {
  try {
    const stored = localStorage.getItem(CITY_KEY) || "";
    if (CITIES.some((c) => c.value === stored)) return stored;
  } catch {
    /* ignore */
  }
  return "";
}

export function setSelectedCity(city) {
  try {
    if (city) localStorage.setItem(CITY_KEY, city);
    else localStorage.removeItem(CITY_KEY);
  } catch {
    /* ignore */
  }
}

export function cityLabel(city) {
  return CITIES.find((c) => c.value === city)?.label || "All cities";
}

export function withCityParam(params = {}, city = getSelectedCity()) {
  const next = { ...params };
  if (city) next.city = city;
  return next;
}
