import { submitDonation } from "../api.js";
import { escapeHtml, setTitle } from "../utils.js";

const PURPOSE_OPTIONS = [
  { value: "general", label: "General fund" },
  { value: "emergency", label: "Emergency rescue" },
  { value: "abc", label: "ABC / sterilisation" },
  { value: "food_medicine", label: "Food & medicine" },
  { value: "shelter", label: "Shelter upkeep" },
];

const PRESETS = [500, 1000, 2000, 5000];
const MIN_AMOUNT = 100;

function presetButtons() {
  return PRESETS.map(
    (amount) =>
      `<button type="button" class="amount-preset" data-amount="${amount}">₹${amount.toLocaleString("en-IN")}</button>`
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
      message: String(formData.get("message") || "").trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing…";

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

export function renderDonate(root) {
  setTitle("Donate");

  root.innerHTML = `
    <section class="page-hero shell">
      <p class="eyebrow">Donate</p>
      <h1>Support Hyderabad’s street dogs.</h1>
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
            <input id="donor-amount" name="amount" type="number" min="${MIN_AMOUNT}" step="1" required placeholder="Min ₹${MIN_AMOUNT}">
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

          <p class="muted small donate-note">Fill in your details and click Make Payment. We’ll confirm your donation shortly.</p>
        </form>
      </div>
    </section>
  `;

  bindDonateForm(root);
}
