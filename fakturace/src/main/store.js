"use strict";

/* Uložiště dat aplikace.
   Data jsou v jediném souboru JSON ve složce uživatele:
     Windows: %APPDATA%\Fakturace\data.json
     Linux:   ~/.config/Fakturace/data.json
     macOS:   ~/Library/Application Support/Fakturace/data.json

   Zápis je atomický — nejdřív se uloží dočasný soubor, pak se přejmenuje.
   Když počítač spadne uprostřed ukládání, původní data zůstanou nepoškozená. */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

class Store {
  constructor(dir) {
    this.dir = dir;
    this.file = path.join(dir, "data.json");
    this.zalohyDir = path.join(dir, "zalohy");
  }

  async init() {
    await fsp.mkdir(this.dir, { recursive: true });
    await fsp.mkdir(this.zalohyDir, { recursive: true });
  }

  /** Vrátí uložená data, nebo null když aplikace běží poprvé. */
  async read() {
    try {
      const raw = await fsp.readFile(this.file, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === "ENOENT") return null;
      if (err instanceof SyntaxError) {
        // Poškozený soubor si odložíme, ať o data uživatel nepřijde úplně.
        const zachrana = path.join(this.dir, `data-poskozeno-${stamp()}.json`);
        await fsp.rename(this.file, zachrana).catch(() => {});
        const chyba = new Error(
          `Datový soubor je poškozený. Odložil jsem ho do ${zachrana}. ` +
            `Obnovte data ze zálohy ve složce ${this.zalohyDir}.`
        );
        chyba.code = "DATA_CORRUPT";
        throw chyba;
      }
      throw err;
    }
  }

  async write(data) {
    const tmp = this.file + ".tmp";
    const json = JSON.stringify(data, null, 2);
    const fh = await fsp.open(tmp, "w");
    try {
      await fh.writeFile(json, "utf8");
      await fh.sync(); // data musí být na disku dřív, než přejmenujeme
    } finally {
      await fh.close();
    }
    await fsp.rename(tmp, this.file);
    return true;
  }

  /* ---------------- zálohy ---------------- */

  /** Zkopíruje aktuální data do složky záloh a staré zálohy promaže. */
  async zalohuj(maxPocet = 30) {
    if (!fs.existsSync(this.file)) return null;
    const cil = path.join(this.zalohyDir, `data-${stamp()}.json`);
    await fsp.copyFile(this.file, cil);
    await this.proberZalohy(maxPocet);
    return cil;
  }

  async proberZalohy(maxPocet) {
    const soubory = (await fsp.readdir(this.zalohyDir))
      .filter((f) => f.startsWith("data-") && f.endsWith(".json"))
      .sort(); // název obsahuje datum, řadí se tedy chronologicky
    const kSmazani = soubory.slice(0, Math.max(0, soubory.length - maxPocet));
    for (const f of kSmazani) {
      await fsp.unlink(path.join(this.zalohyDir, f)).catch(() => {});
    }
  }

  async seznamZaloh() {
    const soubory = await fsp.readdir(this.zalohyDir).catch(() => []);
    const vysledek = [];
    for (const f of soubory) {
      if (!f.endsWith(".json")) continue;
      const p = path.join(this.zalohyDir, f);
      const st = await fsp.stat(p).catch(() => null);
      if (st) vysledek.push({ nazev: f, cesta: p, velikost: st.size, cas: st.mtimeMs });
    }
    return vysledek.sort((a, b) => b.cas - a.cas);
  }
}

/** Časové razítko do názvu souboru: 2026-08-08_143012 */
function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

module.exports = { Store };
