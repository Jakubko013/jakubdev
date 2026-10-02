/* Service worker mobilní appky Fakturace.
   Při změně souborů appky zvyš CACHE_VERSION, jinak si telefony s appkou
   nainstalovanou na ploše nechají starou verzi. */
const CACHE_VERZE = "fakturace-mobile-v4";

const PRECACHE = [
  "./index.html",
  "./styles-mobile.css",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./js/api-web.js",
  "./js/mobile-nav.js",
  "./js/registrace-sw.js",
  "./js/vendor/qrcode.min.js",
  "./js/vendor/html2canvas.min.js",
  "./js/vendor/jspdf.min.js",
  "../src/renderer/styles.css",
  "../src/renderer/js/core/util.js",
  "../src/renderer/js/core/validace.js",
  "../src/renderer/js/core/platba.js",
  "../src/renderer/js/core/vypocet.js",
  "../src/renderer/js/core/model.js",
  "../src/renderer/js/core/dph.js",
  "../src/renderer/js/core/denik.js",
  "../src/renderer/js/core/csv.js",
  "../src/renderer/js/ui.js",
  "../src/renderer/js/stav.js",
  "../src/renderer/js/doklad.js",
  "../src/renderer/js/pohledy/prehled.js",
  "../src/renderer/js/pohledy/faktury.js",
  "../src/renderer/js/pohledy/faktura.js",
  "../src/renderer/js/pohledy/klienti.js",
  "../src/renderer/js/pohledy/vydaje.js",
  "../src/renderer/js/pohledy/denik.js",
  "../src/renderer/js/pohledy/dph.js",
  "../src/renderer/js/pohledy/opakovane.js",
  "../src/renderer/js/pohledy/upominky.js",
  "../src/renderer/js/pohledy/nastaveni.js",
  "../src/renderer/js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERZE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((klice) => Promise.all(klice.filter((k) => k !== CACHE_VERZE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Volání na ARES (nebo cokoli mimo tento web) jde vždy přímo na síť.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Vlastní soubory appky: síť s okamžitým přechodem na cache, když není
  // připojení — aktualizace se projeví hned při dalším online spuštění.
  event.respondWith(
    fetch(req)
      .then((odpoved) => {
        const kopie = odpoved.clone();
        caches.open(CACHE_VERZE).then((cache) => cache.put(req, kopie));
        return odpoved;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
