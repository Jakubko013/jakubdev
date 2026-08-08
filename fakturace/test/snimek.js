"use strict";

/* Průchod aplikací pro kontrolu, že se všechny obrazovky vykreslí.

   Spouští se jako samostatná aplikace Electronu nad dočasnými daty:

     xvfb-run electron test/snimek.js [složka pro snímky]

   Test projde všechny obrazovky, uloží z každé snímek a skončí nenulovým
   kódem, pokud renderer nahlásí chybu. Data uživatele se nedotkne — běží
   nad vlastní dočasnou složkou. */

const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { app, BrowserWindow } = require("electron");

const { Store } = require("../src/main/store");
const { registrujObsluhy } = require("../src/main/ipc");
const { htmlDoPdf } = require("../src/main/pdf");
const { demoData } = require("./demo-data");

const CIL = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : path.join(os.tmpdir(), "fakturace-snimky");
const DOCASNA_DATA = fs.mkdtempSync(path.join(os.tmpdir(), "fakturace-test-"));

const chyby = [];
let okno = null;

app.setPath("userData", DOCASNA_DATA);
app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  await fsp.mkdir(CIL, { recursive: true });

  const store = new Store(DOCASNA_DATA);
  await store.init();
  const data = demoData();
  await store.write(data);

  registrujObsluhy({ store, dejOkno: () => okno });

  okno = new BrowserWindow({
    width: 1400,
    height: 950,
    show: true,
    backgroundColor: "#f4f6fa",
    webPreferences: {
      preload: path.join(__dirname, "..", "src", "main", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  okno.webContents.on("console-message", (_e, uroven, zprava, radek, zdroj) => {
    if (uroven >= 2) chyby.push(`konzole: ${zprava} (${zdroj}:${radek})`);
  });
  okno.webContents.on("render-process-gone", (_e, detail) =>
    chyby.push("renderer spadl: " + detail.reason)
  );
  okno.webContents.on("preload-error", (_e, cesta, chyba) =>
    chyby.push("preload selhal: " + chyba.message)
  );

  await okno.loadFile(path.join(__dirname, "..", "src", "renderer", "index.html"));
  await pockej(700);

  const prvniFaktura = data.faktury[0].id;
  const obrazovky = [
    ["prehled", "01-prehled"],
    ["faktury", "02-faktury"],
    ["faktura/" + prvniFaktura, "03-faktura"],
    ["klienti", "04-klienti"],
    ["vydaje", "05-vydaje"],
    ["denik", "06-denik"],
    ["dph", "07-dph"],
    ["opakovane", "08-opakovane"],
    ["upominky", "09-upominky"],
    ["nastaveni", "10-nastaveni"],
  ];

  for (const [cesta, nazev] of obrazovky) {
    await okno.webContents.executeJavaScript(`location.hash = ${JSON.stringify("#" + cesta)};`);
    // Snímek se pořizuje z posledního vykresleného rámce — počkáme, až
    // prohlížeč obrazovku opravdu přemaluje, jinak zachytíme tu předchozí.
    await pockejNaVykresleni(okno);
    const nadpis = await okno.webContents.executeJavaScript(
      `document.getElementById("nadpis").textContent`
    );
    const delkaObsahu = await okno.webContents.executeJavaScript(
      `document.getElementById("pohled").innerHTML.length`
    );
    if (!delkaObsahu) chyby.push(`obrazovka ${cesta} se vykreslila prázdná`);
    const obrazek = await okno.webContents.capturePage();
    await fsp.writeFile(path.join(CIL, nazev + ".png"), obrazek.toPNG());
    console.log(`  ${cesta.padEnd(28)} → ${nadpis} (${delkaObsahu} znaků)`);
  }

  // Doklad: vykreslíme fakturu tak, jak půjde do PDF, a zkontrolujeme i tisk.
  const htmlDokladu = await okno.webContents.executeJavaScript(
    `Fx.doklad.htmlDokladu(Fx.stav.faktura(${JSON.stringify(prvniFaktura)}), Fx.stav.dej())`
  );
  const souborDokladu = path.join(CIL, "doklad.html");
  await fsp.writeFile(souborDokladu, htmlDokladu, "utf8");

  const oknoDokladu = new BrowserWindow({ width: 900, height: 1220, show: true });
  await oknoDokladu.loadFile(souborDokladu);
  await pockejNaVykresleni(oknoDokladu);
  const snimekDokladu = await oknoDokladu.webContents.capturePage();
  await fsp.writeFile(path.join(CIL, "11-faktura-doklad.png"), snimekDokladu.toPNG());
  oknoDokladu.destroy();

  const pdf = await htmlDoPdf(htmlDokladu);
  await fsp.writeFile(path.join(CIL, "faktura.pdf"), pdf);
  console.log(`  PDF dokladu                  → ${Math.round(pdf.length / 1024)} kB`);

  if (!htmlDokladu.includes("data:image/png;base64")) {
    chyby.push("na dokladu chybí QR platba");
  }

  console.log(`\nSnímky uložené do ${CIL}`);
  if (chyby.length) {
    console.error("\nNalezené potíže:");
    chyby.forEach((c) => console.error("  · " + c));
  } else {
    console.log("Bez chyb.");
  }

  await fsp.rm(DOCASNA_DATA, { recursive: true, force: true });
  app.exit(chyby.length ? 1 : 0);
});

function pockej(ms) {
  return new Promise((hotovo) => setTimeout(hotovo, ms));
}

/** Počká na dva překreslené rámce a chvíli navíc na dopočítání písem. */
async function pockejNaVykresleni(cilOkna) {
  await cilOkna.webContents.executeJavaScript(
    `new Promise((hotovo) => requestAnimationFrame(() => requestAnimationFrame(hotovo)))`
  );
  await pockej(350);
}
