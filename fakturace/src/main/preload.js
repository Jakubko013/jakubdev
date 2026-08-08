"use strict";

/* Most mezi oknem aplikace a systémem.

   Okno samo nemá přístup k disku ani k Node.js — všechno jde přes tenhle
   seznam pojmenovaných funkcí. Renderer tak nemůže udělat nic, co tu není. */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  data: {
    nacti: () => ipcRenderer.invoke("data:nacti"),
    uloz: (data) => ipcRenderer.invoke("data:uloz", data),
    zaloha: (maxPocet) => ipcRenderer.invoke("data:zaloha", maxPocet),
    seznamZaloh: () => ipcRenderer.invoke("data:seznam-zaloh"),
    export: (data, nazev) => ipcRenderer.invoke("data:export", { data, nazev }),
    import: () => ipcRenderer.invoke("data:import"),
  },
  soubor: {
    ulozText: (obsah, nazev, popisTypu, pripona) =>
      ipcRenderer.invoke("soubor:uloz-text", { obsah, nazev, popisTypu, pripona }),
    otevri: (cesta) => ipcRenderer.invoke("app:otevri-soubor", cesta),
  },
  pdf: {
    uloz: (html, nazev) => ipcRenderer.invoke("pdf:uloz", { html, nazev }),
    tisk: (html) => ipcRenderer.invoke("pdf:tisk", { html }),
  },
  qr: (text) => ipcRenderer.invoke("qr:vytvor", text),
  ares: (ico) => ipcRenderer.invoke("ares:najdi", ico),
  app: {
    info: () => ipcRenderer.invoke("app:info"),
    otevriSlozkuDat: () => ipcRenderer.invoke("app:otevri-slozku-dat"),
  },
  potvrd: (volby) => ipcRenderer.invoke("dialog:potvrd", volby),
  naAkciMenu: (posluchac) => {
    ipcRenderer.on("menu:akce", (_e, akce) => posluchac(akce));
  },
});
