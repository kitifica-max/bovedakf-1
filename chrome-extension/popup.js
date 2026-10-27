"use strict";

const API = "https://kf1.kitifica.com";

// Brand look: one color pair per account card (same pairs as the web app), cycled by position.
const STAR =
  "100.0,4.0 114.2,19.2 132.8,9.8 141.0,29.0 161.7,26.5 162.8,47.3 183.1,52.0 177.1,72.0 194.5,83.3 182.0,100.0 194.5,116.7 177.1,128.0 183.1,148.0 162.8,152.7 161.7,173.5 141.0,171.0 132.8,190.2 114.2,180.8 100.0,196.0 85.8,180.8 67.2,190.2 59.0,171.0 38.3,173.5 37.2,152.7 16.9,148.0 22.9,128.0 5.5,116.7 18.0,100.0 5.5,83.3 22.9,72.0 16.9,52.0 37.2,47.3 38.3,26.5 59.0,29.0 67.2,9.8 85.8,19.2";
const PAIRS = [
  { bg: "#f1d3e3", ink: "#1b5a93", star: "#1f6fb2", starInk: "#f1d3e3" },
  { bg: "#0b6845", ink: "#b9e35a", star: "#b9e35a", starInk: "#0b6845" },
  { bg: "#f4eea6", ink: "#4e52a6", star: "#4e52a6", starInk: "#f4eea6" },
  { bg: "#f7c55a", ink: "#a81b42", star: "#b31f47", starInk: "#f7c55a" },
  { bg: "#1f6fb2", ink: "#ffffff", star: "#ffd27a", starInk: "#1f6fb2" },
  { bg: "#b31f47", ink: "#ffd27a", star: "#ffd27a", starInk: "#b31f47" },
  { bg: "#4e52a6", ink: "#f4eea6", star: "#f4eea6", starInk: "#4e52a6" },
];
const starSvg = (fill) =>
  `<svg viewBox="0 0 200 200" aria-hidden="true"><polygon points="${STAR}" fill="${fill}"/></svg>`;
const lockStar = `<svg class="star" viewBox="0 0 200 200" aria-hidden="true"><polygon points="${STAR}" fill="#ffd27a"/><g transform="translate(50 46) scale(4.2)" fill="none" stroke="#b31f47" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g></svg>`;

// ── Storage ──────────────────────────────────────────────────────────────────

const store = {
  get: (key) =>
    new Promise((res) => chrome.storage.local.get([key], (d) => res(d[key] ?? null))),
  set: (key, val) =>
    new Promise((res) => chrome.storage.local.set({ [key]: val }, res)),
  remove: (key) =>
    new Promise((res) => chrome.storage.local.remove([key], res)),
};

// ── API ───────────────────────────────────────────────────────────────────────

async function apiFetch(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => (el.className = "toast"), 2200);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initial(service) {
  return (service || "?").slice(0, 2).toUpperCase();
}

// ── Autofill ──────────────────────────────────────────────────────────────────

async function doFill(token, credId, btn) {
  btn.classList.add("filling");
  btn.textContent = "...";

  let cred;
  try {
    cred = await apiFetch(`/api/extension/credentials/${credId}`, token);
  } catch {
    toast("Error al obtener credencial", "error");
    btn.classList.remove("filling");
    btn.textContent = "Llenar";
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Injected on demand (activeTab), so no <all_urls> content script is needed.
  // The function is serialized into the page; it must be fully self-contained.
  let res;
  try {
    [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (username, password) => {
        const pwField = document.querySelector('input[type="password"]');
        if (!pwField) return { ok: false, error: "no-password-field" };

        const form = pwField.closest("form");
        const root = form ?? document;

        const userSelectors = [
          'input[type="email"]',
          'input[autocomplete="username"]',
          'input[autocomplete="email"]',
          'input[name*="email" i]',
          'input[name*="user" i]',
          'input[name*="login" i]',
          'input[id*="email" i]',
          'input[id*="user" i]',
          'input[type="text"]',
        ];

        let unameField = null;
        for (const sel of userSelectors) {
          const el = root.querySelector(sel);
          if (el && el !== pwField) {
            unameField = el;
            break;
          }
        }

        // React-compatible fill: use the native setter to bypass value tracking
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;

        const fillField = (el, value) => {
          if (nativeSetter) {
            nativeSetter.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          el.focus();
        };

        if (unameField) fillField(unameField, username);
        fillField(pwField, password);
        return { ok: true };
      },
      args: [cred.username, cred.password],
    });
  } catch {
    toast("No se pudo escribir en esta página", "error");
    btn.classList.remove("filling");
    btn.textContent = "Llenar";
    return;
  }

  if (!res?.result?.ok) {
    toast("No se encontró formulario de login en esta página", "error");
    btn.classList.remove("filling");
    btn.textContent = "Llenar";
    return;
  }

  toast("¡Campos llenados!");
  setTimeout(() => window.close(), 900);
}

// ── Credential list renderer ──────────────────────────────────────────────────

function renderList(creds, query, token) {
  const filtered = query
    ? creds.filter(
        (c) =>
          c.service.toLowerCase().includes(query) ||
          c.username.toLowerCase().includes(query)
      )
    : creds;

  const container = document.getElementById("credList");

  if (!filtered.length) {
    container.innerHTML = `<div class="state-center">${lockStar}${query ? "Sin resultados" : "Sin credenciales guardadas"}</div>`;
    return;
  }

  container.innerHTML = filtered
    .map((c, i) => {
      const p = PAIRS[i % PAIRS.length];
      return `
    <div class="cred-item" data-id="${esc(c.id)}" style="--bg:${p.bg};--ink:${p.ink};--star-ink:${p.starInk}">
      <div class="cred-icon">${starSvg(p.star)}<span>${esc(initial(c.service))}</span></div>
      <div class="cred-info">
        <div class="cred-service">${esc(c.service)}</div>
        <div class="cred-user">${esc(c.username)}</div>
      </div>
      <button class="fill-btn">Llenar</button>
    </div>`;
    })
    .join("");

  container.querySelectorAll(".cred-item").forEach((item) => {
    const btn = item.querySelector(".fill-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      doFill(token, item.dataset.id, btn);
    });
    item.addEventListener("click", () => {
      doFill(token, item.dataset.id, btn);
    });
  });
}

// ── Screens ───────────────────────────────────────────────────────────────────

function renderSetup() {
  document.getElementById("settingsPanel").style.display = "none";
  document.getElementById("app").innerHTML = `
    <div class="setup">
      ${lockStar}
      <h2>Conectar tu bóveda</h2>
      <p>Genera un token de API en tu dashboard (Configuración → Tokens de API) y pégalo aquí para habilitar el autocompletado.</p>
      <input class="input" id="tokenInput" type="password"
        placeholder="kf1_xxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false">
      <button class="btn-primary" id="connectBtn">Conectar</button>
      <a class="link-hint" href="https://kf1.kitifica.com/dashboard/settings" target="_blank" rel="noopener noreferrer">
        Ir al dashboard para generar un token →
      </a>
    </div>
  `;

  const btn = document.getElementById("connectBtn");
  const input = document.getElementById("tokenInput");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });

  btn.addEventListener("click", async () => {
    const token = input.value.trim();
    if (!token) {
      input.focus();
      return;
    }
    btn.textContent = "Verificando...";
    btn.disabled = true;
    try {
      await apiFetch("/api/extension/credentials", token);
      await store.set("kf1_token", token);
      renderMain(token);
    } catch {
      btn.textContent = "Conectar";
      btn.disabled = false;
      toast("Token inválido o expirado", "error");
      input.focus();
    }
  });
}

async function renderMain(token) {
  document.getElementById("settingsPanel").style.display = "none";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let domain = "";
  try {
    domain = new URL(tab?.url ?? "").hostname;
  } catch {
    domain = "";
  }

  document.getElementById("app").innerHTML = `
    ${
      domain
        ? `<div class="domain-bar">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="currentColor" stroke-width="1.1" opacity="0.5"/>
              <path d="M3 5h4M5 3v4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity="0.5"/>
            </svg>
            ${esc(domain)}
           </div>`
        : ""
    }
    <div class="search-wrap">
      <input class="search" id="searchInput" placeholder="Buscar servicio o usuario..." autocomplete="off">
    </div>
    <div class="cred-list" id="credList">
      <div class="state-center"><div class="spinner"></div><br>Cargando...</div>
    </div>
  `;

  const searchInput = document.getElementById("searchInput");
  searchInput.focus();

  let allCreds = [];

  try {
    const { credentials } = await apiFetch("/api/extension/credentials", token);
    allCreds = credentials;

    // Sort: domain-matching credentials first
    if (domain) {
      const domainBase = domain.replace(/^www\./, "");
      allCreds.sort((a, b) => {
        const aMatch = a.service.toLowerCase().includes(domainBase) ? -1 : 0;
        const bMatch = b.service.toLowerCase().includes(domainBase) ? -1 : 0;
        return aMatch - bMatch;
      });
    }

    renderList(allCreds, "", token);
  } catch (err) {
    if (err.status === 401) {
      await store.remove("kf1_token");
      renderSetup();
      toast("Sesión expirada — reconectá tu cuenta", "error");
      return;
    }
    document.getElementById("credList").innerHTML =
      `<div class="state-center">Error al cargar credenciales</div>`;
  }

  searchInput.addEventListener("input", () => {
    renderList(allCreds, searchInput.value.trim().toLowerCase(), token);
  });
}

// ── Settings panel ─────────────────────────────────────────────────────────────

document.getElementById("gearBtn").addEventListener("click", async () => {
  const token = await store.get("kf1_token");
  const panel = document.getElementById("settingsPanel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
  if (!token) {
    panel.style.display = "none";
  }
});

document.getElementById("disconnectBtn").addEventListener("click", async () => {
  await store.remove("kf1_token");
  document.getElementById("settingsPanel").style.display = "none";
  renderSetup();
  toast("Cuenta desconectada");
});

// ── Boot ───────────────────────────────────────────────────────────────────────

(async () => {
  const token = await store.get("kf1_token");
  if (token) {
    renderMain(token);
  } else {
    renderSetup();
  }
})();
