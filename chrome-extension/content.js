// Listens for fill messages from the popup and injects credentials into login forms.
// Uses the native input setter trick so React/Vue/Angular synthetic events fire correctly.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "kf1-fill") return;

  const { username, password } = msg;

  const pwField = document.querySelector('input[type="password"]');
  if (!pwField) {
    sendResponse({ ok: false, error: "no-password-field" });
    return;
  }

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

  function fillField(el, value) {
    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.focus();
  }

  if (unameField) fillField(unameField, username);
  fillField(pwField, password);

  sendResponse({ ok: true });
});
