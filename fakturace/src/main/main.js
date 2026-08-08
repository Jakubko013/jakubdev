"use strict";

const path = require("path");
const { app, BrowserWindow, shell, Menu } = require("electron");

const { Store } = require("./store");
const { registrujObsluhy } = require("./ipc");

app.setAppUserModelId("cz.fakturace.app");
/* Bez toho by se v polích s datem nabízel formát podle jazyka systému
   (na anglickém Windows měsíc/den/rok). */
app.commandLine.appendSwitch("lang", "cs-CZ");

let hlavniOkno = null;
let store = null;

/* Jen jedna spuštěná kopie — dvě okna nad jedním datovým souborem by si
   navzájem přepisovala změny. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!hlavniOkno) return;
    if (hlavniOkno.isMinimized()) hlavniOkno.restore();
    hlavniOkno.focus();
  });
  app.whenReady().then(spustAplikaci);
}

async function spustAplikaci() {
  store = new Store(app.getPath("userData"));
  await store.init();
  registrujObsluhy({ store, dejOkno: () => hlavniOkno });
  vytvorMenu();
  vytvorOkno();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) vytvorOkno();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function vytvorOkno() {
  hlavniOkno = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#f4f6fa",
    title: "Fakturace",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  hlavniOkno.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  // Odkazy na web otevírej v prohlížeči, ne uvnitř aplikace.
  hlavniOkno.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  hlavniOkno.on("closed", () => {
    hlavniOkno = null;
  });
}

function posliDoOkna(akce) {
  if (hlavniOkno && !hlavniOkno.isDestroyed()) {
    hlavniOkno.webContents.send("menu:akce", akce);
  }
}

function vytvorMenu() {
  const sablona = [
    {
      label: "Doklady",
      submenu: [
        { label: "Nová faktura", accelerator: "CmdOrCtrl+N", click: () => posliDoOkna("nova-faktura") },
        { label: "Nový výdaj", accelerator: "CmdOrCtrl+Shift+N", click: () => posliDoOkna("novy-vydaj") },
        { type: "separator" },
        { label: "Přehled faktur", accelerator: "CmdOrCtrl+1", click: () => posliDoOkna("faktury") },
        { label: "Výdaje", accelerator: "CmdOrCtrl+2", click: () => posliDoOkna("vydaje") },
        { label: "Peněžní deník", accelerator: "CmdOrCtrl+3", click: () => posliDoOkna("denik") },
        { label: "DPH", accelerator: "CmdOrCtrl+4", click: () => posliDoOkna("dph") },
        { type: "separator" },
        { role: "quit", label: "Ukončit" },
      ],
    },
    {
      label: "Data",
      submenu: [
        { label: "Vytvořit zálohu", click: () => posliDoOkna("zaloha") },
        { label: "Exportovat data do souboru…", click: () => posliDoOkna("export") },
        { label: "Obnovit data ze souboru…", click: () => posliDoOkna("import") },
        { type: "separator" },
        { label: "Nastavení", accelerator: "CmdOrCtrl+,", click: () => posliDoOkna("nastaveni") },
        { label: "Otevřít složku s daty", click: () => shell.openPath(app.getPath("userData")) },
      ],
    },
    {
      label: "Úpravy",
      submenu: [
        { role: "undo", label: "Zpět" },
        { role: "redo", label: "Znovu" },
        { type: "separator" },
        { role: "cut", label: "Vyjmout" },
        { role: "copy", label: "Kopírovat" },
        { role: "paste", label: "Vložit" },
        { role: "selectAll", label: "Vybrat vše" },
      ],
    },
    {
      label: "Zobrazení",
      submenu: [
        { role: "reload", label: "Načíst znovu" },
        { role: "resetZoom", label: "Původní velikost" },
        { role: "zoomIn", label: "Zvětšit" },
        { role: "zoomOut", label: "Zmenšit" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Celá obrazovka" },
        { role: "toggleDevTools", label: "Nástroje pro vývojáře" },
      ],
    },
    {
      label: "Nápověda",
      submenu: [{ label: "O aplikaci", click: () => posliDoOkna("o-aplikaci") }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(sablona));
}
