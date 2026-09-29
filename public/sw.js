// ponytail: cache only static assets (JS/CSS/fonts/images), never HTML.
// Navigation always goes to network so a deploy never serves a stale 500.
const CACHE = "securevault-shell-v3";
const STATIC_EXTS = /\.(?:js|css|woff2?|ttf|otf|png|svg|ico|webp|jpg|jpeg)(\?|$)/;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Never cache navigation (HTML) — always hit the network.
  if (request.mode === "navigate") return;

  // Only cache static assets.
  if (!STATIC_EXTS.test(new URL(request.url).pathname)) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
    )
  );
});
