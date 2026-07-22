/* Service worker aplikace Cenové nabídky.
   Při změně nabidky.html nebo tohoto souboru zvyš CACHE_VERSION,
   jinak si nainstalované aplikace nechají starou verzi. */
const CACHE_VERSION = "nabidky-v2";
const PRECACHE = [
  "./nabidky.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./logo-isopaneels.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Claude API a jiné ne-GET požadavky jdou vždy přímo na síť
  if (req.method !== "GET" || url.hostname === "api.anthropic.com") return;

  // Vlastní soubory: síť s fallbackem na cache (aktualizace se projeví hned, offline funguje)
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  // Fonty (Google Fonts): cache-first, ať aplikace vypadá stejně i offline
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
      )
    );
  }
});
