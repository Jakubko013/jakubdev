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

/* Aplikace vypadá jinak podle toho, jestli je uživatel plátcem DPH.
   Projdeme proto obě varianty — neplátce je výchozí stav aplikace. */
const VARIANTY = [
  { klic: "neplatce", nazev: "neplátce DPH", plateceDph: false },
  { klic: "platce", nazev: "plátce DPH", plateceDph: true },
];

const chyby = [];
let okno = null;

app.setPath("userData", DOCASNA_DATA);
app.disableHardwareAcceleration();

/* Mezi variantami zůstane aplikace chvíli bez okna. Bez této obsluhy by se
   Electron sám ukončil a druhá varianta by se vůbec neprošla. */
app.on("window-all-closed", () => {});

app.whenReady().then(async () => {
  await fsp.mkdir(CIL, { recursive: true });

  const store = new Store(DOCASNA_DATA);
  await store.init();

  registrujObsluhy({ store, dejOkno: () => okno });

  for (const varianta of VARIANTY) {
    console.log(`\n${varianta.nazev}`);
    try {
      await projdiVariantu(store, varianta);
    } catch (chyba) {
      chyby.push(`${varianta.klic}: průchod skončil chybou — ${chyba.message}`);
      if (okno && !okno.isDestroyed()) okno.destroy();
      okno = null;
    }
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

async function projdiVariantu(store, varianta) {
  const slozka = path.join(CIL, varianta.klic);
  await fsp.mkdir(slozka, { recursive: true });

  const data = demoData({ plateceDph: varianta.plateceDph });
  await store.write(data);

  okno = otevriOkno(varianta.klic);
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
    ...(varianta.plateceDph ? [["dph", "07-dph"]] : []),
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
    if (!delkaObsahu) chyby.push(`${varianta.klic}: obrazovka ${cesta} se vykreslila prázdná`);
    const obrazek = await okno.webContents.capturePage();
    await fsp.writeFile(path.join(slozka, nazev + ".png"), obrazek.toPNG());
    console.log(`  ${cesta.padEnd(28)} → ${nadpis} (${delkaObsahu} znaků)`);
  }

  // Nabídka DPH se neplátci vůbec nenabízí.
  const nabidkaDph = await okno.webContents.executeJavaScript(
    `!!document.querySelector('#nabidka a[href="#dph"]')`
  );
  if (nabidkaDph !== varianta.plateceDph) {
    chyby.push(`${varianta.klic}: položka DPH v nabídce je ${nabidkaDph ? "navíc" : "nedostupná"}`);
  }

  // Doklad: vykreslíme fakturu tak, jak půjde do PDF, a zkontrolujeme i tisk.
  const htmlDokladu = await okno.webContents.executeJavaScript(
    `Fx.doklad.htmlDokladu(Fx.stav.faktura(${JSON.stringify(prvniFaktura)}), Fx.stav.dej())`
  );
  const souborDokladu = path.join(slozka, "doklad.html");
  await fsp.writeFile(souborDokladu, htmlDokladu, "utf8");

  const oknoDokladu = new BrowserWindow({ width: 900, height: 1220, show: true, parent: okno });
  await oknoDokladu.loadFile(souborDokladu);
  await pockejNaVykresleni(oknoDokladu);
  const snimekDokladu = await oknoDokladu.webContents.capturePage();
  await fsp.writeFile(path.join(slozka, "11-faktura-doklad.png"), snimekDokladu.toPNG());
  oknoDokladu.destroy();

  const pdf = await htmlDoPdf(htmlDokladu);
  await fsp.writeFile(path.join(slozka, "faktura.pdf"), pdf);
  console.log(`  PDF dokladu                  → ${Math.round(pdf.length / 1024)} kB`);

  if (!htmlDokladu.includes("data:image/png;base64")) {
    chyby.push(`${varianta.klic}: na dokladu chybí QR platba`);
  }
  // Doklad neplátce nesmí vyčíslovat daň, plátcův naopak musí.
  const maRekapitulaci = htmlDokladu.includes("Rekapitulace DPH");
  if (maRekapitulaci !== varianta.plateceDph) {
    chyby.push(
      `${varianta.klic}: rekapitulace DPH na dokladu ${maRekapitulaci ? "přebývá" : "chybí"}`
    );
  }
  if (!varianta.plateceDph && !htmlDokladu.includes("Nejsem plátcem DPH")) {
    chyby.push("neplatce: na dokladu chybí poznámka o neplátcovství");
  }

  /* Zavíráme přes destroy — close() by spustilo uložení rozepsaných dat
     a přepsalo by tím ukázku připravenou pro další variantu. */
  okno.destroy();
  okno = null;
  await pockej(200);
}

function otevriOkno(klic) {
  const nove = new BrowserWindow({
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

  nove.webContents.on("console-message", (_e, uroven, zprava, radek, zdroj) => {
    if (uroven >= 2) chyby.push(`${klic}: konzole: ${zprava} (${zdroj}:${radek})`);
  });
  nove.webContents.on("render-process-gone", (_e, detail) =>
    chyby.push(`${klic}: renderer spadl: ` + detail.reason)
  );
  nove.webContents.on("preload-error", (_e, cesta, chyba) =>
    chyby.push(`${klic}: preload selhal: ` + chyba.message)
  );
  return nove;
}

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
