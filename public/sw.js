// ponytail: minimal app-shell cache for offline read of already-visited
// pages. Not a full offline data sync — dashboard data still needs network.
// Upgrade to a proper caching strategy (e.g. Workbox) if offline write or
// background sync is ever needed.
const CACHE = "securevault-shell-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/"])));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
