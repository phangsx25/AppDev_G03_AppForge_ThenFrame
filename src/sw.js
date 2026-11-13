// Cache only versioned build assets. Never intercept auth, API, storage or image blobs.
const assets = self.__WB_MANIFEST;
const CACHE =
  "thenframe-shell-" +
  JSON.stringify(assets)
    .split("")
    .reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0);
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([...new Set(assets.map((x) => x.url))])),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("thenframe-shell-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html")),
    );
    return;
  }
  if (
    assets.some(
      (x) => new URL(x.url, self.location.origin).pathname === url.pathname,
    )
  )
    event.respondWith(
      caches.match(event.request).then((c) => c || fetch(event.request)),
    );
});
