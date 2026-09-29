"use strict";

const API = "https://kf1.kitifica.com";

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
  try {
    const cred = await apiFetch(`/api/extension/credentials/${credId}`, token);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(
      tab.id,
      { type: "kf1-fill", username: cred.username, password: cred.password },
      (resp) => {
        if (chrome.runtime.lastError || !resp?.ok) {
          toast("No se encontró formulario de login en esta página", "error");
          btn.classList.remove("filling");
          btn.textContent = "Llenar";
        } else {
          toast("¡Campos llenados!");
          setTimeout(() => window.close(), 900);
        }
      }
    );
  } catch {
    toast("Error al obtener credencial", "error");
    btn.classList.remove("filling");
    btn.textContent = "Llenar";
  }
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
    container.innerHTML = `<div class="state-center">${query ? "Sin resultados" : "Sin credenciales guardadas"}</div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (c) => `
    <div class="cred-item" data-id="${esc(c.id)}">
      <div class="cred-icon">${esc(initial(c.service))}</div>
      <div class="cred-info">
        <div class="cred-service">${esc(c.service)}</div>
        <div class="cred-user">${esc(c.username)}</div>
      </div>
      <button class="fill-btn">Llenar</button>
    </div>`
    )
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
      <h2>Conectar tu bóveda</h2>
      <p>Genera un token de API en tu dashboard (Configuración → Tokens de API) y pégalo aquí para habilitar el autocompletado.</p>
      <input class="input" id="tokenInput" type="password"
        placeholder="kf1_xxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false">
      <button class="btn-primary" id="connectBtn">Conectar</button>
      <a class="link-hint" href="https://kf1.kitifica.com/dashboard/settings" target="_blank">
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
