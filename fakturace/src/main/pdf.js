"use strict";

/* Tisk dokladu do PDF.

   Doklad se v okně aplikace skládá jako samostatná HTML stránka (viz
   renderer/js/doklad.js). Tady ji načteme do skrytého okna a necháme
   Chromium vytisknout do PDF. Obrázky (logo, QR kód) jsou v HTML vložené
   jako data URL, takže stránka nic nestahuje ze sítě. */

const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { BrowserWindow } = require("electron");

const OKRAJ_PALCE = 0; // okraje si řeší samotná šablona (padding v mm)

async function htmlDoPdf(html) {
  const docasny = path.join(
    os.tmpdir(),
    `fakturace-tisk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.html`
  );
  await fsp.writeFile(docasny, html, "utf8");

  const okno = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true, javascript: false, sandbox: true },
  });

  try {
    await okno.loadFile(docasny);
    // Chromium potřebuje chvíli na doměření písem, jinak se text může zalomit jinak.
    await new Promise((hotovo) => setTimeout(hotovo, 250));
    return await okno.webContents.printToPDF({
      pageSize: "A4",
      printBackground: true,
      margins: {
        marginType: "custom",
        top: OKRAJ_PALCE,
        bottom: OKRAJ_PALCE,
        left: OKRAJ_PALCE,
        right: OKRAJ_PALCE,
      },
    });
  } finally {
    if (!okno.isDestroyed()) okno.destroy();
    await fsp.unlink(docasny).catch(() => {});
  }
}

/** Uloží PDF na zadanou cestu a vrátí ji. */
async function ulozPdf(html, cesta) {
  const data = await htmlDoPdf(html);
  await fsp.writeFile(cesta, data);
  return cesta;
}

module.exports = { htmlDoPdf, ulozPdf };
