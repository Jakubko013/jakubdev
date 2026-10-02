"use strict";

/* Sestaví mobilní appku do "ploché" složky pro GitHub Pages (index.html
   v kořeni, ne v podsložce mobile/) — na rozdíl od build-artifact.js,
   který dělá jeden HTML soubor, tohle je normální statický web s vlastními
   soubory JS/CSS, takže funguje i service worker a manifest pro instalaci.

   Zdroj pravdy zůstávají soubory v src/renderer a mobile/js — tenhle skript
   se spouští znovu pokaždé, když se v nich něco změní, a přepíše cílovou
   složku (typicky klon samostatného repozitáře pro GitHub Pages).

   Použití: node mobile/build-pages.js <cilova-slozka>
*/

const fs = require("fs");
const path = require("path");

const KOREN = path.join(__dirname, "..");
const CIL = process.argv[2];
if (!CIL) {
  console.error("Použití: node mobile/build-pages.js <cilova-slozka>");
  process.exit(1);
}

/* Zdrojová cesta -> cílová cesta v ploché struktuře. */
const SOUBORY = [
  ["mobile/index.html", "index.html"],
  ["mobile/tisk.html", "tisk.html"],
  ["mobile/styles-mobile.css", "styles-mobile.css"],
  ["mobile/manifest.webmanifest", "manifest.webmanifest"],
  ["mobile/sw.js", "sw.js"],
  ["mobile/icon-192.png", "icon-192.png"],
  ["mobile/icon-512.png", "icon-512.png"],
  ["mobile/apple-touch-icon.png", "apple-touch-icon.png"],
  ["mobile/js/api-web.js", "js/api-web.js"],
  ["mobile/js/tisk-stranka.js", "js/tisk-stranka.js"],
  ["mobile/js/mobile-nav.js", "js/mobile-nav.js"],
  ["mobile/js/registrace-sw.js", "js/registrace-sw.js"],
  ["mobile/js/vendor/qrcode.min.js", "js/vendor/qrcode.min.js"],
  ["src/renderer/styles.css", "styles.css"],
  ["src/renderer/js/core/util.js", "js/core/util.js"],
  ["src/renderer/js/core/validace.js", "js/core/validace.js"],
  ["src/renderer/js/core/platba.js", "js/core/platba.js"],
  ["src/renderer/js/core/vypocet.js", "js/core/vypocet.js"],
  ["src/renderer/js/core/model.js", "js/core/model.js"],
  ["src/renderer/js/core/dph.js", "js/core/dph.js"],
  ["src/renderer/js/core/denik.js", "js/core/denik.js"],
  ["src/renderer/js/core/csv.js", "js/core/csv.js"],
  ["src/renderer/js/ui.js", "js/ui.js"],
  ["src/renderer/js/stav.js", "js/stav.js"],
  ["src/renderer/js/doklad.js", "js/doklad.js"],
  ["src/renderer/js/pohledy/prehled.js", "js/pohledy/prehled.js"],
  ["src/renderer/js/pohledy/faktury.js", "js/pohledy/faktury.js"],
  ["src/renderer/js/pohledy/faktura.js", "js/pohledy/faktura.js"],
  ["src/renderer/js/pohledy/klienti.js", "js/pohledy/klienti.js"],
  ["src/renderer/js/pohledy/vydaje.js", "js/pohledy/vydaje.js"],
  ["src/renderer/js/pohledy/denik.js", "js/pohledy/denik.js"],
  ["src/renderer/js/pohledy/dph.js", "js/pohledy/dph.js"],
  ["src/renderer/js/pohledy/opakovane.js", "js/pohledy/opakovane.js"],
  ["src/renderer/js/pohledy/upominky.js", "js/pohledy/upominky.js"],
  ["src/renderer/js/pohledy/nastaveni.js", "js/pohledy/nastaveni.js"],
  ["src/renderer/js/app.js", "js/app.js"],
];

/* index.html a sw.js odkazují na sdílené soubory přes "../src/renderer/…" —
   v ploché struktuře jsou už jen jeden krok od kořene. */
function preplesniCesty(obsah) {
  return obsah
    .replace(/\.\.\/src\/renderer\/styles\.css/g, "styles.css")
    .replace(/\.\.\/src\/renderer\/js\//g, "js/");
}

function zapisSoubor(cilovaCesta, obsah) {
  fs.mkdirSync(path.dirname(cilovaCesta), { recursive: true });
  fs.writeFileSync(cilovaCesta, obsah);
}

let pocetSouboru = 0;
for (const [zdrojRel, cilRel] of SOUBORY) {
  const zdrojCesta = path.join(KOREN, zdrojRel);
  const cilCesta = path.join(CIL, cilRel);
  const jeText = /\.(html|css|js|webmanifest|json)$/.test(zdrojRel);

  if (jeText) {
    const obsah = preplesniCesty(fs.readFileSync(zdrojCesta, "utf8"));
    zapisSoubor(cilCesta, obsah);
  } else {
    zapisSoubor(cilCesta, fs.readFileSync(zdrojCesta));
  }
  pocetSouboru++;
}

console.log(`Sestaveno ${pocetSouboru} souborů do ${CIL}`);
