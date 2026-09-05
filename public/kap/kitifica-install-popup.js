/*!
 * Kitifica App Directa — Install Popup v2 (CSP-compliant)
 * Drop-in: <script src="kitifica-install-popup.js"></script>
 * Archivos PNG requeridos (misma carpeta):
 *   install_iphone_ipad.png, install_android.png,
 *   install_safari_desktop.png, install_chrome_desktop.png, appdirectaicon.png
 *
 * CSP: zero inline styles — all runtime changes go through a <style> element
 * carrying the page nonce, or via CSS class toggles.
 */
(function () {
  'use strict';

  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (window.navigator.standalone === true) return;
  if (localStorage.getItem('kap-installed') === '1') return;

  // ── Detección de dispositivo ─────────────────────────────────────────────
  var ua = navigator.userAgent;
  var isIOS    = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isIPadOS = !isIOS && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua);
  var isAnd    = /Android/.test(ua);
  var isOther  = isAnd && (/MIUI|XiaoMi|MiuiBrowser/.test(ua) || /HUAWEI|HMSCore/.test(ua));
  var isSafari = !isIOS && !isIPadOS && !isAnd && /Safari/.test(ua) && !/Chrome|CriOS/.test(ua);

  var initDev = (isIOS || isIPadOS) ? 'ios'
    : isOther  ? 'other'
    : isAnd    ? 'android'
    : isSafari ? 'safari'
    : 'chrome';

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener('appinstalled', function () {
    localStorage.setItem('kap-installed', '1');
    kapClose();
  });
  window.matchMedia('(display-mode: standalone)').addEventListener('change', function (e) {
    if (e.matches) { localStorage.setItem('kap-installed', '1'); kapClose(); }
  });

  // Base path del script
  var _el = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var base = _el && _el.src ? _el.src.replace(/[^/]*$/, '') : './';

  // Nonce for CSP — our script loads via 'self' (no nonce on <script>), so
  // we grab it from a Next.js hydration script that does carry the nonce.
  var _nonce = '';
  try {
    var _ns = document.querySelector('script[nonce]');
    if (_ns) _nonce = _ns.getAttribute('nonce');
  } catch (_e) {}

  // ── Config de dispositivos ───────────────────────────────────────────────
  var DEVS = {
    ios:     { label: 'iPhone / iPad',  title: 'Instala en iPhone o iPad',     img: 'install_iphone_ipad.png',    cols: 3 },
    android: { label: 'Android',        title: 'Instala en Android',            img: 'install_android.png',        cols: 2 },
    safari:  { label: 'Safari Mac',     title: 'Instala en Safari',             img: 'install_safari_desktop.png', cols: 3 },
    chrome:  { label: 'Chrome',         title: 'Instala en Chrome',             img: 'install_chrome_desktop.png', cols: 2 },
    other:   { label: 'REDMI · Huawei', title: 'Instala en REDMI o Huawei',    img: 'install_android.png',        cols: 2 }
  };

  // ── Iconos SVG ───────────────────────────────────────────────────────────
  var iArrow  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  var iBack   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
  var iShield = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  var iZap    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  var iBox    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>';
  var iDl     = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  var iWarn   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  var logoKitifica = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508.32 135.45" height="28"><defs><style>.kl1{fill:#00b58b}.kl2{fill:#fff}</style></defs><g><g><g><path class="kl1" d="M24.19,33.87h76.93c6.58,0,11.91,5.34,11.91,11.91v62.76c0,6.53-5.3,11.82-11.82,11.82H24.1c-6.53,0-11.82-5.3-11.82-11.82v-62.76c0-6.58,5.34-11.91,11.91-11.91Z"/><path d="M100.25,125.69H25.06c-9.99,0-18.11-8.12-18.11-18.11v-60.93c0-9.99,8.12-18.11,18.11-18.11h75.19c9.99,0,18.11,8.12,18.11,18.11v60.93c0,9.99-8.12,18.11-18.11,18.11ZM25.06,39.2c-4.11,0-7.46,3.35-7.46,7.46v60.93c0,4.11,3.35,7.46,7.46,7.46h75.19c4.11,0,7.46-3.35,7.46-7.46v-60.93c0-4.11-3.35-7.46-7.46-7.46H25.06Z"/></g><g><path class="kl1" d="M14.6,24.5h96.11c5.12,0,9.27,4.15,9.27,9.27v14.24c0,4.9-3.98,8.87-8.87,8.87H14.2c-4.9,0-8.87-3.98-8.87-8.87v-14.24c0-5.12,4.15-9.27,9.27-9.27Z"/><path d="M115.96,62.21H9.35c-5.15,0-9.35-4.19-9.35-9.35v-17.71c0-8.81,7.17-15.98,15.98-15.98h93.35c8.81,0,15.98,7.17,15.98,15.98v17.71c0,5.15-4.19,9.35-9.35,9.35ZM10.65,51.56h104v-16.4c0-2.94-2.39-5.33-5.33-5.33H15.98c-2.94,0-5.33,2.39-5.33,5.33v16.4Z"/></g><path d="M86.89,24.5h-10.65v-10.67c0-1.75-1.42-3.18-3.17-3.18h-20.81c-1.75,0-3.17,1.42-3.17,3.18v10.67h-10.65v-10.67c0-7.62,6.2-13.83,13.83-13.83h20.81c7.62,0,13.83,6.2,13.83,13.83v10.67Z"/><g><rect class="kl2" x="51.47" y="46.23" width="22.37" height="22.37" rx="11.18" ry="11.18"/><path d="M65.32,73.93h-5.33c-7.64,0-13.85-6.21-13.85-13.85v-5.33c0-7.64,6.21-13.85,13.85-13.85h5.33c7.64,0,13.85,6.21,13.85,13.85v5.33c0,7.64-6.21,13.85-13.85,13.85ZM59.99,51.56c-1.76,0-3.2,1.43-3.2,3.2v5.33c0,1.76,1.43,3.2,3.2,3.2h5.33c1.76,0,3.2-1.43,3.2-3.2v-5.33c0-1.76-1.43-3.2-3.2-3.2h-5.33Z"/></g></g><g><path d="M171,109.62c-1.74,1.92-4.2,2.88-7.37,2.88s-5.64-.96-7.37-2.88c-1.74-1.92-2.61-4.43-2.61-7.54v-60.87c0-3.03.87-5.5,2.61-7.43,1.74-1.92,4.19-2.88,7.37-2.88s5.64.96,7.37,2.88c1.74,1.92,2.61,4.4,2.61,7.43v20.73h10.86l16.08-26.05c1.03-1.7,2.16-2.96,3.38-3.77,1.22-.81,2.9-1.22,5.04-1.22,2.81,0,5.19.96,7.06,2.88,1.87,1.92,2.81,4.43,2.81,7.54v60.87c0,3.03-.87,5.5-2.61,7.43-1.74,1.92-4.19,2.88-7.37,2.88s-5.64-.96-7.37-2.88c-1.74-1.92-2.61-4.43-2.61-7.54v-56.17h-10.86v56.17c0,3.03-.87,5.5-2.61,7.43Z"/><path d="M238.63,109.62c-1.74,1.92-4.2,2.88-7.37,2.88s-5.64-.96-7.37-2.88c-1.74-1.92-2.61-4.43-2.61-7.54v-60.87c0-3.03.87-5.5,2.61-7.43,1.74-1.92,4.19-2.88,7.37-2.88s5.64.96,7.37,2.88c1.74,1.92,2.61,4.4,2.61,7.43v20.73h10.86l16.08-26.05c1.03-1.7,2.16-2.96,3.38-3.77,1.22-.81,2.9-1.22,5.04-1.22,2.81,0,5.19.96,7.06,2.88,1.87,1.92,2.81,4.43,2.81,7.54v60.87c0,3.03-.87,5.5-2.61,7.43-1.74,1.92-4.19,2.88-7.37,2.88s-5.64-.96-7.37-2.88c-1.74-1.92-2.61-4.43-2.61-7.54v-56.17h-10.86v56.17c0,3.03-.87,5.5-2.61,7.43Z"/><path d="M311.68,72.27h-10.86V45.84c0-3.03.87-5.5,2.61-7.43,1.74-1.92,4.19-2.88,7.37-2.88s5.64.96,7.37,2.88c1.74,1.92,2.61,4.4,2.61,7.43v26.43h10.86V42.14c0-3.03.87-5.5,2.61-7.43,1.74-1.92,4.19-2.88,7.37-2.88s5.64.96,7.37,2.88c1.74,1.92,2.61,4.4,2.61,7.43v63.08h-10.86V45.84c0-3.03-.87-5.5-2.61-7.43-1.74-1.92-4.19-2.88-7.37-2.88s-5.64.96-7.37,2.88c-1.74,1.92-2.61,4.4-2.61,7.43v26.43Z"/><path d="M402.83,55.77V42.14c0-3.03.87-5.5,2.61-7.43,1.74-1.92,4.19-2.88,7.37-2.88s5.64.96,7.37,2.88c1.74,1.92,2.61,4.4,2.61,7.43v13.63h10.86V42.14c0-3.03.87-5.5,2.61-7.43,1.74-1.92,4.19-2.88,7.37-2.88s5.64.96,7.37,2.88c1.74,1.92,2.61,4.4,2.61,7.43v63.08h-10.86V45.84c0-3.03-.87-5.5-2.61-7.43-1.74-1.92-4.19-2.88-7.37-2.88s-5.64.96-7.37,2.88c-1.74,1.92-2.61,4.4-2.61,7.43v9.93h-10.86Z"/></g></g><g><path d="M500.15,74.48c0,19.31-6.69,35.21-19.94,46.85-13.25,11.64-30.28,17.33-50.72,17.33h-28.59V11.3h28.59c20.44,0,37.47,5.8,50.72,17.33,13.25,11.64,19.94,27.42,19.94,45.85Zm-52.94,33.96c8.67-7.7,13.09-18.15,13.09-30.63,0-12.48-4.42-22.86-13.09-30.63-8.67-7.7-20.04-11.41-33.62-11.41h-15.48v84.08h15.48c13.58,0,24.95-3.71,33.62-11.41Z"/><path d="M159.22,24.5c7.62,0,13.83,6.2,13.83,13.83v10.67h10.65v-10.67c0-7.62,6.2-13.83,13.83-13.83h20.81c7.62,0,13.83,6.2,13.83,13.83v10.67h10.65v-10.67c0-7.62,6.2-13.83,13.83-13.83h20.81c7.62,0,13.83,6.2,13.83,13.83v10.67h10.65v-10.67c0-1.75-1.42-3.18-3.17-3.18h-20.81c-1.75,0-3.17,1.42-3.17,3.18v10.67h-10.65v-10.67c0-1.75-1.42-3.18-3.17-3.18h-20.81c-1.75,0-3.17,1.42-3.17,3.18v10.67h-10.65v-10.67c0-1.75-1.42-3.18-3.17-3.18h-20.81c-1.75,0-3.17,1.42-3.17,3.18v10.67h-10.65v-10.67c0-7.62,6.2-13.83,13.83-13.83h20.81Z"/></g></g></svg>';

  // ── CSS ──────────────────────────────────────────────────────────────────
  var css = [
    ':root{--kap-green:#00b58b;--kap-green-dark:#009472;--kap-green-dim:rgba(0,181,139,.12);',
    '--kap-text:#0f1b17;--kap-muted:#4a6358;--kap-surface:#f4faf8;--kap-surface-2:#ffffff;',
    '--kap-border:#d0e8e0;--kap-shadow:0 24px 64px rgba(0,0,0,.18),0 4px 16px rgba(0,0,0,.08);',
    '--kap-overlay-bg:rgba(10,30,22,.6)}',
    '@media(prefers-color-scheme:dark){:root{--kap-text:#e2f2ec;--kap-muted:#7ab09a;',
    '--kap-surface:#0d1c17;--kap-surface-2:#142a21;--kap-border:#1e3d30;',
    '--kap-shadow:0 24px 64px rgba(0,0,0,.55),0 4px 16px rgba(0,0,0,.3);',
    '--kap-overlay-bg:rgba(0,0,0,.72)}}',
    '[data-theme="dark"]{--kap-text:#e2f2ec;--kap-muted:#7ab09a;--kap-surface:#0d1c17;',
    '--kap-surface-2:#142a21;--kap-border:#1e3d30;',
    '--kap-shadow:0 24px 64px rgba(0,0,0,.55),0 4px 16px rgba(0,0,0,.3);',
    '--kap-overlay-bg:rgba(0,0,0,.72)}',
    '[data-theme="light"]{--kap-text:#0f1b17;--kap-muted:#4a6358;--kap-surface:#f4faf8;',
    '--kap-surface-2:#ffffff;--kap-border:#d0e8e0;',
    '--kap-shadow:0 24px 64px rgba(0,0,0,.18),0 4px 16px rgba(0,0,0,.08);',
    '--kap-overlay-bg:rgba(10,30,22,.6)}',

    '#kap-overlay{position:fixed;inset:0;z-index:99999;background:var(--kap-overlay-bg);',
    'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
    'display:flex;align-items:flex-end;justify-content:center}',
    '@media(min-width:480px){#kap-overlay{align-items:center;padding:20px}}',

    '#kap-card{position:relative;background:var(--kap-surface-2);color:var(--kap-text);',
    'width:100%;max-width:440px;border-radius:20px 20px 0 0;',
    'box-shadow:var(--kap-shadow);',
    'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    'overflow:hidden;animation:kap-up .35s cubic-bezier(.16,1,.3,1) both;',
    'max-height:90dvh;display:flex;flex-direction:column}',
    '@media(min-width:480px){#kap-card{border-radius:20px;max-height:85vh}}',
    '@media(prefers-reduced-motion:reduce){#kap-card{animation:none}}',
    '@keyframes kap-up{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}',

    '.kap-header{padding:20px 20px 0;display:flex;align-items:center;justify-content:center;',
    'gap:10px;flex-shrink:0;cursor:grab;touch-action:none}',
    '.kap-header svg{height:28px;width:auto}',
    '.kap-close{position:absolute;top:12px;right:14px;width:32px;height:32px;border:none;',
    'background:none;cursor:pointer;font-size:22px;line-height:1;color:var(--kap-muted);',
    'border-radius:8px;display:flex;align-items:center;justify-content:center;',
    'font-family:inherit;transition:color .15s,background .15s}',
    '.kap-close:hover{color:var(--kap-text);background:var(--kap-surface)}',
    '.kap-body{flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;padding:0 24px 24px}',

    /* Step 1 */
    '.kap-app-icon{display:block;margin:20px auto 0;width:88px;height:88px}',
    '.kap-s1-title{font-size:22px;font-weight:700;letter-spacing:-.5px;color:var(--kap-text);',
    'text-align:center;text-wrap:balance;margin:16px 0 4px}',
    '.kap-tagline{text-align:center;font-size:14px;color:var(--kap-muted);',
    'margin:0 0 20px;line-height:1.5}',
    '.kap-benefits{background:var(--kap-surface);border:1px solid var(--kap-border);',
    'border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:12px;margin-bottom:12px}',
    '.kap-benefit{display:flex;align-items:flex-start;gap:12px}',
    '.kap-benefit-icon{width:34px;height:34px;border-radius:10px;background:var(--kap-green-dim);',
    'display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.kap-benefit-icon svg{width:18px;height:18px;color:var(--kap-green)}',
    '.kap-benefit-text strong{display:block;font-size:13px;font-weight:600;color:var(--kap-text);margin-bottom:1px}',
    '.kap-benefit-text span{font-size:12px;color:var(--kap-muted);line-height:1.4}',
    '.kap-security{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;',
    'border-radius:10px;background:var(--kap-green-dim);',
    'font-size:12px;color:var(--kap-muted);margin-bottom:20px;line-height:1.4}',
    '.kap-security svg{width:16px;height:16px;flex-shrink:0;color:var(--kap-green);margin-top:1px}',

    /* Step visibility (class-driven, no inline styles) */
    '#kap-step-2{display:none}',
    '#kap-card.kap-s2 #kap-step-1{display:none}',
    '#kap-card.kap-s2 #kap-step-2{display:block}',

    '.kap-back{background:none;border:none;cursor:pointer;color:var(--kap-muted);font-size:13px;',
    'display:flex;align-items:center;gap:6px;padding:10px 0;margin:12px 0 6px;',
    'font-family:inherit;transition:color .15s}',
    '.kap-back:hover{color:var(--kap-green)}',
    '.kap-back svg{width:16px;height:16px}',
    '.kap-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}',
    '.kap-tab{padding:6px 13px;border-radius:20px;font-size:12.5px;font-weight:600;',
    'border:1.5px solid var(--kap-border);background:var(--kap-surface);',
    'color:var(--kap-muted);cursor:pointer;font-family:inherit;transition:all .15s;',
    'white-space:nowrap}',
    '.kap-tab.active{background:var(--kap-green);color:#fff;border-color:var(--kap-green)}',
    '.kap-device-label{font-size:11px;font-weight:600;letter-spacing:.08em;',
    'text-transform:uppercase;color:var(--kap-green);margin:0 0 4px}',
    '.kap-device-title{font-size:20px;font-weight:700;letter-spacing:-.4px;',
    'color:var(--kap-text);margin:0 0 14px;text-wrap:balance}',
    '.kap-diagram{display:flex;justify-content:center;margin-bottom:16px}',
    '.kap-diagram.col3 img{width:100%}',
    '.kap-diagram.col2 img{width:67%;margin:0 auto}',
    '.kap-diagram img{height:auto;display:block}',
    '.kap-compat-note{display:flex;align-items:flex-start;gap:10px;',
    'background:#fff8ec;border:1px solid #f5d78c;border-radius:10px;',
    'padding:11px 13px;margin-bottom:14px;font-size:12px;line-height:1.5;color:#7a5c1a}',
    '.kap-compat-note svg{width:16px;height:16px;flex-shrink:0;margin-top:1px}',
    '@media(prefers-color-scheme:dark){.kap-compat-note{',
    'background:rgba(245,215,140,.1);border-color:rgba(245,215,140,.3);color:#d4a847}}',
    '[data-theme="dark"] .kap-compat-note{',
    'background:rgba(245,215,140,.1);border-color:rgba(245,215,140,.3);color:#d4a847}',
    '[data-theme="light"] .kap-compat-note{background:#fff8ec;border-color:#f5d78c;color:#7a5c1a}',
    '.kap-support{margin-top:20px;padding-top:16px;border-top:1px solid var(--kap-border);',
    'text-align:center;font-size:12px;color:var(--kap-muted)}',
    '.kap-support a{color:var(--kap-green);text-decoration:none;font-weight:600}',
    '.kap-support a:hover{text-decoration:underline}',

    /* Button */
    '.kap-btn{display:flex;align-items:center;justify-content:center;gap:8px;',
    'width:100%;padding:14px;background:var(--kap-green);color:#fff;',
    'border:none;border-radius:12px;font-size:15px;font-weight:600;font-family:inherit;',
    'cursor:pointer;transition:background .15s}',
    '.kap-btn:hover{background:var(--kap-green-dark)}',
    '.kap-btn svg{width:18px;height:18px}',
    '#kap-install-btn{display:none}',
    '#kap-install-btn.kap-show{display:flex}',

    /* Animation-end: kill entrance animation so CSS transforms can take over */
    '#kap-card.kap-no-anim{animation:none}',
    /* Header grabbing state */
    '.kap-header.kap-grabbing{cursor:grabbing}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  if (_nonce) style.setAttribute('nonce', _nonce);
  document.head.appendChild(style);

  // ── Dynamic <style> for runtime values (drag, close) ─────────────────────
  // All element.style.xxx assignments are replaced by updating this element's
  // textContent — CSP only requires the nonce, which we already have.
  var dynEl = document.createElement('style');
  if (_nonce) dynEl.setAttribute('nonce', _nonce);
  document.head.appendChild(dynEl);

  function dyn(css) { dynEl.textContent = css; }

  // ── HTML ─────────────────────────────────────────────────────────────────
  var tabs = Object.keys(DEVS).map(function (k) {
    return '<button class="kap-tab" data-device="' + k + '" type="button">' + DEVS[k].label + '</button>';
  }).join('');

  var html = [
    '<div id="kap-overlay" role="dialog" aria-modal="true" aria-labelledby="kap-title">',
    '<div id="kap-card">',
    '<div class="kap-header">' + logoKitifica +
    '<button class="kap-close" id="kap-close" type="button" aria-label="Cerrar">&#215;</button></div>',

    /* Step 1 */
    '<div class="kap-body" id="kap-step-1">',
    '<img class="kap-app-icon" src="' + base + 'appdirectaicon.png" alt="App Directa" width="88" height="88">',
    '<h2 class="kap-s1-title" id="kap-title">App Directa</h2>',
    '<p class="kap-tagline">Instala esta app directamente en tu dispositivo,<br>sin pasar por ninguna tienda de apps.</p>',
    '<div class="kap-benefits">',
    '<div class="kap-benefit"><div class="kap-benefit-icon">' + iZap + '</div>',
    '<div class="kap-benefit-text"><strong>Acceso inmediato</strong>',
    '<span>Se abre como app nativa. Ícono en tu pantalla de inicio, sin abrir el navegador.</span></div></div>',
    '<div class="kap-benefit"><div class="kap-benefit-icon">' + iBox + '</div>',
    '<div class="kap-benefit-text"><strong>Sin tiendas de apps</strong>',
    '<span>No necesita App Store ni Google Play. Sin esperas ni aprobaciones.</span></div></div>',
    '<div class="kap-benefit"><div class="kap-benefit-icon">' + iShield + '</div>',
    '<div class="kap-benefit-text"><strong>Segura y verificada</strong>',
    '<span>Presentada y garantizada por Kitifica. Solo instala lo que ves en pantalla.</span></div></div>',
    '</div>',
    '<div class="kap-security">' + iShield,
    '<span>No accede a datos del sistema ni de otras apps.',
    ' Puedes desinstalarla en cualquier momento desde la configuración de tu dispositivo.</span></div>',
    '<button class="kap-btn" id="kap-next" type="button">Cómo instalar ' + iArrow + '</button>',
    '</div>',

    /* Step 2 */
    '<div class="kap-body" id="kap-step-2">',
    '<button class="kap-back" id="kap-back" type="button" aria-label="Volver">' + iBack + ' Volver</button>',
    '<div class="kap-tabs">' + tabs + '</div>',
    '<p class="kap-device-label" id="kap-dev-label"></p>',
    '<h2 class="kap-device-title" id="kap-dev-title"></h2>',
    '<div id="kap-diagram-area"></div>',
    '<button class="kap-btn" id="kap-install-btn" type="button">' + iDl + ' Instalar app</button>',
    '<div class="kap-support">¿Problemas al instalar? Escríbenos a ',
    '<a href="mailto:hola@kitifica.com">hola@kitifica.com</a></div>',
    '</div>',

    '</div></div>'
  ].join('');

  var container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // ── Eventos ──────────────────────────────────────────────────────────────
  document.getElementById('kap-next').addEventListener('click', function () {
    showStep(2);
  });
  document.getElementById('kap-back').addEventListener('click', function () {
    showStep(1);
  });
  document.getElementById('kap-install-btn').addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (r) {
        if (r.outcome === 'accepted') { localStorage.setItem('kap-installed', '1'); kapClose(); }
        deferredPrompt = null;
      });
    }
  });
  document.querySelectorAll('.kap-tab').forEach(function (btn) {
    btn.addEventListener('click', function () { setDevice(this.dataset.device); });
  });

  setDevice(initDev);

  // Close for this view only (X, click outside the card, or Escape). It is
  // NOT remembered — the popup shows again on the next load until the app is
  // actually installed / running standalone.
  document.getElementById('kap-close').addEventListener('click', kapClose);
  document.getElementById('kap-overlay').addEventListener('click', function (e) {
    if (e.target === document.getElementById('kap-overlay')) kapClose();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') kapClose();
  });

  // Let inline transforms win once the entrance keyframe has played.
  (function () {
    var c = document.getElementById('kap-card');
    if (c) c.addEventListener('animationend', function () {
      c.classList.add('kap-no-anim');
    });
  })();

  // Drag the header down to dismiss (iOS-sheet style). Tracks 1:1, rubber-bands
  // upward, projects momentum on release, springs back if it wasn't a real
  // dismiss. Scoped to the header so body scroll and buttons keep working.
  (function () {
    var card = document.getElementById('kap-card');
    var header = document.querySelector('.kap-header');
    if (!card || !header) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DRAWER = 'cubic-bezier(.32,.72,0,1)';
    var startY = 0, curY = 0, lastY = 0, lastT = 0, vel = 0, dragging = false;

    header.addEventListener('pointerdown', function (e) {
      dragging = true;
      startY = e.clientY; curY = 0; lastY = e.clientY; lastT = e.timeStamp; vel = 0;
      dyn('#kap-card{transition:none;transform:translateY(0)}');
      header.classList.add('kap-grabbing');
      try { header.setPointerCapture(e.pointerId); } catch {}
    });

    header.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      curY = dy < 0 ? dy * 0.35 : dy;
      dyn('#kap-card{transition:none;transform:translateY(' + curY + 'px)}');
      var dt = e.timeStamp - lastT;
      if (dt > 0) vel = ((e.clientY - lastY) / dt) * 1000;
      lastY = e.clientY; lastT = e.timeStamp;
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      header.classList.remove('kap-grabbing');
      try { header.releasePointerCapture(e.pointerId); } catch {}
      var projected = curY + (vel / 1000) * 0.998 / (1 - 0.998);
      if (projected > 120 || vel > 600) {
        kapClose();
      } else {
        var trans = reduce ? 'none' : 'transform .35s ' + DRAWER;
        dyn('#kap-card{transition:' + trans + ';transform:translateY(0)}');
      }
    }
    header.addEventListener('pointerup', end);
    header.addEventListener('pointercancel', end);
  })();

  // ── Funciones ─────────────────────────────────────────────────────────────
  function setDevice(key) {
    var d = DEVS[key];
    document.querySelectorAll('.kap-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.device === key);
    });
    document.getElementById('kap-dev-label').textContent = d.label;
    document.getElementById('kap-dev-title').textContent = d.title;

    var colCls = d.cols === 2 ? 'col2' : 'col3';
    var note = key === 'other'
      ? '<div class="kap-compat-note">' + iWarn +
        '<span><strong>Abre Chrome</strong> (no el navegador de fábrica).' +
        ' Si no lo tienes, descárgalo gratis desde la tienda de tu dispositivo.' +
        ' En Huawei sin Google Play, busca Chrome en <strong>AppGallery</strong>' +
        ' o <strong>Petal Search</strong>.</span></div>'
      : '';
    document.getElementById('kap-diagram-area').innerHTML =
      note + '<div class="kap-diagram ' + colCls + '">' +
      '<img src="' + base + d.img + '" alt="Instrucciones ' + d.label + '" loading="lazy"></div>';

    var showBtn = key === 'android' || key === 'other';
    document.getElementById('kap-install-btn').classList.toggle('kap-show', showBtn);
  }

  function showStep(n) {
    document.getElementById('kap-card').classList.toggle('kap-s2', n === 2);
  }

  // Exits along the same path it entered — the card slides back down while
  // the scrim fades. Starts from whatever transform the drag left it at, so
  // there's no jump.
  function kapClose() {
    var o = document.getElementById('kap-overlay');
    if (!o) return;
    var c = document.getElementById('kap-card');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !c) {
      dyn('#kap-overlay{opacity:0;transition:opacity .15s}');
      setTimeout(function () { container.remove(); }, 160);
      return;
    }
    var dist = c.getBoundingClientRect().height + 48;
    dyn('#kap-card{transform:translateY(' + dist + 'px);transition:transform .3s cubic-bezier(.32,.72,0,1)}' +
        '#kap-overlay{opacity:0;transition:opacity .3s ease}');
    setTimeout(function () { container.remove(); }, 320);
  }

})();
