"use strict";

/* Slepí mobilní appku do jednoho samostatného HTML souboru.

   Artifact (odkaz otevíratelný přímo na telefonu) umí publikovat jen
   jediný soubor bez odkazů ven, takže se sem naskládá přesně to, co
   normálně mobile/index.html načítá přes <script src>/<link> — jen vložené
   napřímo. Zdroj pravdy zůstávají soubory v src/renderer a mobile/js;
   tenhle skript se spouští znovu pokaždé, když se v nich něco změní.

   Použití: node mobile/build-artifact.js [cilovy-soubor.html]
*/

const fs = require("fs");
const path = require("path");

const KOREN = path.join(__dirname, "..");
const cil = process.argv[2] || path.join(__dirname, "..", "..", "artifact-build.html");

const CSS_SOUBORY = ["src/renderer/styles.css", "mobile/styles-mobile.css"];

const JS_SOUBORY = [
  "mobile/js/vendor/qrcode.min.js",
  "src/renderer/js/core/util.js",
  "src/renderer/js/core/validace.js",
  "src/renderer/js/core/platba.js",
  "src/renderer/js/core/vypocet.js",
  "src/renderer/js/core/model.js",
  "src/renderer/js/core/dph.js",
  "src/renderer/js/core/denik.js",
  "src/renderer/js/core/csv.js",
  "src/renderer/js/ui.js",
  "mobile/js/api-web.js",
  "src/renderer/js/stav.js",
  "src/renderer/js/doklad.js",
  "src/renderer/js/pohledy/prehled.js",
  "src/renderer/js/pohledy/faktury.js",
  "src/renderer/js/pohledy/faktura.js",
  "src/renderer/js/pohledy/klienti.js",
  "src/renderer/js/pohledy/vydaje.js",
  "src/renderer/js/pohledy/denik.js",
  "src/renderer/js/pohledy/dph.js",
  "src/renderer/js/pohledy/opakovane.js",
  "src/renderer/js/pohledy/upominky.js",
  "src/renderer/js/pohledy/nastaveni.js",
  "src/renderer/js/app.js",
  "mobile/js/mobile-nav.js",
];

function cti(relCesta) {
  return fs.readFileSync(path.join(KOREN, relCesta), "utf8");
}

/* </script> uvnitř řetězců v šablonách dokladu by ukončil <script> tag
   předčasně — v celém zdroji se to nestává, ale pro jistotu se to hlídá. */
function zkontrolujBezpecnost(obsah, nazev) {
  if (/<\/script/i.test(obsah)) {
    throw new Error(`${nazev} obsahuje "</script" — nešlo by ho bezpečně vložit inline.`);
  }
}

const css = CSS_SOUBORY.map(cti).join("\n\n");

const jsBloky = JS_SOUBORY.map((souborRel) => {
  const obsah = cti(souborRel);
  zkontrolujBezpecnost(obsah, souborRel);
  return `<script>\n/* ${souborRel} */\n${obsah}\n</script>`;
}).join("\n\n");

const html = `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
<script>
  /* Jednosouborová appka nemá vedle sebe žádnou tisk.html, na kterou by
     šlo navigovat (viz mobile/js/api-web.js) — tenhle příznak jí řekne,
     ať rovnou použije záložní tisk přes skrytý rámec v appce samotné. */
  window.FX_BEZ_TISK_STRANKY = true;
</script>
<script>
  /* Artifact stránky nemají vlastní <head>, který bych mohl napsat sám —
     tenhle skript proto meta tagy pro mobilní zobrazení a instalaci na
     plochu dopíše přímo do document.head za běhu, spolehlivě bez ohledu
     na to, jak je stránka na pozadí sestavená. */
  (function () {
    function meta(nazev, obsah) {
      const el = document.createElement("meta");
      el.name = nazev;
      el.content = obsah;
      document.head.appendChild(el);
    }
    meta("mobile-web-app-capable", "yes");
    meta("apple-mobile-web-app-capable", "yes");
    meta("apple-mobile-web-app-status-bar-style", "black-translucent");
    meta("apple-mobile-web-app-title", "Fakturace");
    meta("robots", "noindex, nofollow");
  })();
</script>
<style>
${css}
</style>

<div id="aplikace">
  <div id="drawer-zastineni"></div>
  <nav id="bocnipanel">
    <div class="znacka">
      <b id="znacka-jmeno">Fakturace</b>
      <span id="znacka-popis">daňová evidence</span>
    </div>
    <div class="nabidka" id="nabidka"></div>
    <div class="patka-panelu" id="patka-panelu"></div>
  </nav>

  <main id="obsah">
    <header class="zahlavi">
      <button id="drawer-otevrit" aria-label="Otevřít nabídku" title="Nabídka">
        <span class="hamburger-ikona"></span>
      </button>
      <div>
        <h1 id="nadpis">Přehled</h1>
        <div class="popisek" id="podnadpis"></div>
      </div>
      <div class="vpravo" id="akce-zahlavi"></div>
    </header>
    <div class="stranka" id="pohled"></div>
  </main>
</div>

<div id="hlasky"></div>
<div id="dialogy"></div>

${jsBloky}
`;

fs.writeFileSync(cil, html, "utf8");
const velikostKb = Math.round(fs.statSync(cil).size / 1024);
console.log(`Sestaveno: ${cil} (${velikostKb} kB)`);
