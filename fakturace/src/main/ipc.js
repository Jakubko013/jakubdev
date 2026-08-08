"use strict";

/* Obsluhy volání z okna aplikace.

   Jsou oddělené od vytváření okna, aby se daly použít i v testu, který si
   okno vytváří sám. Renderer se sem dostane jen přes seznam v preload.js. */

const fsp = require("fs/promises");
const path = require("path");
const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const QRCode = require("qrcode");

const { ulozPdf } = require("./pdf");
const { najdiPodleIco } = require("./ares");

/**
 * @param {{ store: import("./store").Store, dejOkno: () => Electron.BrowserWindow|null }} prostredky
 */
function registrujObsluhy({ store, dejOkno }) {
  const okno = () => dejOkno() || BrowserWindow.getAllWindows()[0] || null;

  ipcMain.handle("data:nacti", async () => {
    try {
      return { ok: true, data: await store.read() };
    } catch (err) {
      return { ok: false, chyba: err.message, kod: err.code || null };
    }
  });

  ipcMain.handle("data:uloz", async (_e, data) => {
    try {
      await store.write(data);
      return { ok: true };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("data:zaloha", async (_e, maxPocet) => {
    try {
      return { ok: true, cesta: await store.zalohuj(Number(maxPocet) || 30) };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("data:seznam-zaloh", async () => {
    try {
      return { ok: true, zalohy: await store.seznamZaloh() };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("data:export", async (_e, { data, nazev }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(okno(), {
      title: "Export dat",
      defaultPath: nazev || "fakturace-zaloha.json",
      filters: [{ name: "Datový soubor JSON", extensions: ["json"] }],
    });
    if (canceled || !filePath) return { ok: false, zruseno: true };
    try {
      await fsp.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
      return { ok: true, cesta: filePath };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("data:import", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(okno(), {
      title: "Obnovit data ze souboru",
      properties: ["openFile"],
      filters: [{ name: "Datový soubor JSON", extensions: ["json"] }],
    });
    if (canceled || !filePaths.length) return { ok: false, zruseno: true };
    try {
      const raw = await fsp.readFile(filePaths[0], "utf8");
      return { ok: true, data: JSON.parse(raw), cesta: filePaths[0] };
    } catch (err) {
      return { ok: false, chyba: "Soubor se nepodařilo přečíst: " + err.message };
    }
  });

  ipcMain.handle("soubor:uloz-text", async (_e, { obsah, nazev, popisTypu, pripona }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(okno(), {
      defaultPath: nazev,
      filters: [{ name: popisTypu || "Textový soubor", extensions: [pripona || "txt"] }],
    });
    if (canceled || !filePath) return { ok: false, zruseno: true };
    try {
      await fsp.writeFile(filePath, obsah, "utf8");
      return { ok: true, cesta: filePath };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("pdf:uloz", async (_e, { html, nazev }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(okno(), {
      title: "Uložit PDF",
      defaultPath: nazev || "faktura.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (canceled || !filePath) return { ok: false, zruseno: true };
    try {
      await ulozPdf(html, filePath);
      return { ok: true, cesta: filePath };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("pdf:tisk", async (_e, { html }) => {
    const nahled = new BrowserWindow({
      width: 900,
      height: 1000,
      parent: okno() || undefined,
      title: "Náhled dokladu",
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    const docasny = path.join(app.getPath("temp"), `fakturace-nahled-${Date.now()}.html`);
    await fsp.writeFile(docasny, html, "utf8");
    await nahled.loadFile(docasny);
    nahled.on("closed", () => fsp.unlink(docasny).catch(() => {}));
    nahled.webContents.print({ silent: false, printBackground: true }, () => {});
    return { ok: true };
  });

  ipcMain.handle("qr:vytvor", async (_e, text) => {
    try {
      const dataUrl = await QRCode.toDataURL(String(text), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 320,
        color: { dark: "#111827", light: "#ffffff" },
      });
      return { ok: true, dataUrl };
    } catch (err) {
      return { ok: false, chyba: err.message };
    }
  });

  ipcMain.handle("ares:najdi", async (_e, ico) => najdiPodleIco(ico));

  ipcMain.handle("app:info", async () => ({
    verze: app.getVersion(),
    slozkaDat: app.getPath("userData"),
    electron: process.versions.electron,
    node: process.versions.node,
  }));

  ipcMain.handle("app:otevri-slozku-dat", async () => {
    await shell.openPath(app.getPath("userData"));
    return { ok: true };
  });

  ipcMain.handle("app:otevri-soubor", async (_e, cesta) => {
    await shell.openPath(cesta);
    return { ok: true };
  });

  ipcMain.handle("dialog:potvrd", async (_e, { nadpis, zprava, detail, potvrzeni, nebezpecne }) => {
    const { response } = await dialog.showMessageBox(okno(), {
      type: nebezpecne ? "warning" : "question",
      buttons: [potvrzeni || "Pokračovat", "Zrušit"],
      defaultId: 0,
      cancelId: 1,
      title: nadpis || "Potvrzení",
      message: zprava,
      detail: detail || undefined,
    });
    return { potvrzeno: response === 0 };
  });
}

module.exports = { registrujObsluhy };
