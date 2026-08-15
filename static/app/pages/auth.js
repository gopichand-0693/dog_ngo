import { requestOtp, verifyOtp } from "../api.js";
import { escapeHtml, setTitle } from "../utils.js";

function showMessage(root, type, text) {
  const box = root.querySelector("#auth-message");
  if (!box) return;
  if (!text) {
    box.hidden = true;
    box.textContent = "";
    box.className = "auth-message";
    return;
  }
  box.hidden = false;
  box.className = `auth-message auth-message-${type}`;
  box.textContent = text;
}

function authShell({ title, heading, lede, formHtml, altHtml, panelTitle, panelLede }) {
  return `
    <div class="auth-page shell">
      <div class="auth-split" role="presentation">
        <aside class="auth-panel">
          <div class="auth-panel-copy">
            <p class="auth-panel-eyebrow">ScoobyHouse</p>
            <h2 class="auth-panel-title">${escapeHtml(panelTitle)}</h2>
            <p class="auth-panel-lede">${escapeHtml(panelLede)}</p>
          </div>
        </aside>
        <div class="auth-card">
          <h1 class="auth-card-title">${escapeHtml(heading)}</h1>
          <p class="auth-card-lede muted">${escapeHtml(lede)}</p>
          <h2 class="auth-card-heading">${escapeHtml(title)}</h2>
          <div id="auth-message" class="auth-message" hidden></div>
          ${formHtml}
          <p class="auth-alt muted">${altHtml}</p>
        </div>
      </div>
    </div>
  `;
}

function phoneStepHtml({ includeName = false, submitLabel = "Continue" } = {}) {
  return `
    <form class="auth-form" id="otp-phone-form">
      ${
        includeName
          ? `<label class="field">
              <span class="field-label">Full name</span>
              <input type="text" name="full_name" required autocomplete="name" placeholder="Your name">
            </label>`
          : ""
      }
      <label class="field">
        <span class="field-label">Mobile number</span>
        <div class="phone-input">
          <span class="phone-prefix" aria-hidden="true">+91</span>
          <input
            type="tel"
            name="phone"
            required
            inputmode="numeric"
            autocomplete="tel-national"
            maxlength="10"
            pattern="[6-9][0-9]{9}"
            placeholder="10-digit mobile"
            aria-label="10-digit mobile number"
          >
        </div>
      </label>
      <button class="btn btn-primary" type="submit" id="auth-submit">${escapeHtml(submitLabel)}</button>
    </form>
  `;
}

function otpStepHtml({ phoneDisplay, submitLabel = "Verify & continue" }) {
  return `
    <form class="auth-form" id="otp-verify-form">
      <p class="otp-sent muted">OTP sent to <strong>${escapeHtml(phoneDisplay)}</strong></p>
      <label class="field">
        <span class="field-label">Enter OTP</span>
        <input
          type="text"
          name="otp"
          required
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          pattern="[0-9]{6}"
          placeholder="6-digit OTP"
          class="otp-input"
          aria-label="6-digit OTP"
        >
      </label>
      <button class="btn btn-primary" type="submit" id="auth-submit">${escapeHtml(submitLabel)}</button>
      <div class="otp-actions">
        <button type="button" class="linkish" id="otp-change-phone">Change number</button>
        <button type="button" class="linkish" id="otp-resend" disabled>Resend OTP</button>
      </div>
    </form>
  `;
}

function goHomeSoon() {
  setTimeout(() => {
    history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, 450);
}

function bindOtpFlow(root, { includeName = false, heading, title, lede, panelTitle, panelLede, altHtml }) {
  let phone = "";
  let fullName = "";
  let resendTimer = null;
  let resendLeft = 0;

  function clearResendTimer() {
    if (resendTimer) {
      window.clearInterval(resendTimer);
      resendTimer = null;
    }
  }

  function startResendCountdown(seconds) {
    clearResendTimer();
    resendLeft = seconds;
    const btn = root.querySelector("#otp-resend");
    if (!btn) return;
    const tick = () => {
      if (resendLeft <= 0) {
        btn.disabled = false;
        btn.textContent = "Resend OTP";
        clearResendTimer();
        return;
      }
      btn.disabled = true;
      btn.textContent = `Resend in ${resendLeft}s`;
      resendLeft -= 1;
    };
    tick();
    resendTimer = window.setInterval(tick, 1000);
  }

  function renderPhoneStep() {
    clearResendTimer();
    root.innerHTML = authShell({
      title,
      heading,
      lede,
      panelTitle,
      panelLede,
      altHtml,
      formHtml: phoneStepHtml({
        includeName,
        submitLabel: "Request OTP",
      }),
    });
    const form = root.querySelector("#otp-phone-form");
    const submitBtn = root.querySelector("#auth-submit");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      showMessage(root, "info", "");
      const data = new FormData(form);
      const nextPhone = String(data.get("phone") || "").replace(/\D/g, "");
      const nextName = includeName ? String(data.get("full_name") || "").trim() : "";
      if (includeName && !nextName) {
        showMessage(root, "error", "Please enter your name.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(nextPhone)) {
        showMessage(root, "error", "Enter a valid 10-digit Indian mobile number.");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending OTP…";
      try {
        const payload = { phone: nextPhone };
        if (nextName) payload.full_name = nextName;
        const result = await requestOtp(payload);
        phone = nextPhone;
        fullName = nextName;
        renderOtpStep(result);
      } catch (err) {
        showMessage(root, "error", err.message || "Could not send OTP.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Request OTP";
      }
    });
  }

  function renderOtpStep(requestResult) {
    const phoneDisplay = requestResult.phone_display || `+91 ${phone}`;
    root.innerHTML = authShell({
      title: "Verify OTP",
      heading,
      lede: "Enter the 6-digit code sent to your mobile.",
      panelTitle,
      panelLede,
      altHtml,
      formHtml: otpStepHtml({ phoneDisplay }),
    });
    if (requestResult.debug_otp) {
      showMessage(root, "info", `Dev OTP: ${requestResult.debug_otp} (SMS not configured)`);
    } else {
      showMessage(root, "success", requestResult.message || "OTP sent.");
    }
    startResendCountdown(requestResult.resend_in || 30);

    const form = root.querySelector("#otp-verify-form");
    const submitBtn = root.querySelector("#auth-submit");
    const otpInput = root.querySelector('input[name="otp"]');
    otpInput?.focus();

    root.querySelector("#otp-change-phone")?.addEventListener("click", () => {
      renderPhoneStep();
    });

    root.querySelector("#otp-resend")?.addEventListener("click", async () => {
      const btn = root.querySelector("#otp-resend");
      if (!btn || btn.disabled) return;
      btn.disabled = true;
      try {
        const payload = { phone };
        if (fullName) payload.full_name = fullName;
        const result = await requestOtp(payload);
        if (result.debug_otp) {
          showMessage(root, "info", `Dev OTP: ${result.debug_otp} (SMS not configured)`);
        } else {
          showMessage(root, "success", result.message || "OTP resent.");
        }
        startResendCountdown(result.resend_in || 30);
        otpInput.value = "";
        otpInput.focus();
      } catch (err) {
        showMessage(root, "error", err.message || "Could not resend OTP.");
        btn.disabled = false;
        btn.textContent = "Resend OTP";
      }
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const otp = String(data.get("otp") || "").replace(/\D/g, "");
      if (otp.length !== 6) {
        showMessage(root, "error", "Enter the 6-digit OTP.");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Verifying…";
      try {
        const payload = { phone, otp };
        if (fullName) payload.full_name = fullName;
        await verifyOtp(payload);
        showMessage(root, "success", "Signed in. Taking you home…");
        window.dispatchEvent(new CustomEvent("auth:changed"));
        clearResendTimer();
        goHomeSoon();
      } catch (err) {
        showMessage(root, "error", err.message || "Could not verify OTP.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Verify & continue";
      }
    });
  }

  renderPhoneStep();
}

export async function renderLogin(root) {
  setTitle("Log in");
  bindOtpFlow(root, {
    includeName: false,
    heading: "Log in",
    title: "Enter mobile number",
    lede: "We’ll send a one-time password (OTP) to verify your number.",
    panelTitle: "Find help for every good dog",
    panelLede: "Log in with your mobile number — no password needed.",
    altHtml: `New here? <a href="/signup/" data-link>Create an account</a>`,
  });
}

export async function renderSignup(root) {
  setTitle("Sign up");
  bindOtpFlow(root, {
    includeName: true,
    heading: "Sign up",
    title: "Create your account",
    lede: "Add your name and mobile number. We’ll verify with an OTP.",
    panelTitle: "Join the pack",
    panelLede: "Sign up with OTP and stay close to shelters that need you.",
    altHtml: `Already have an account? <a href="/login/" data-link>Log in</a>`,
  });
}
