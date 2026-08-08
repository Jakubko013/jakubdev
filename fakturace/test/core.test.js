"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const util = require("../src/renderer/js/core/util.js");
const validace = require("../src/renderer/js/core/validace.js");
const platba = require("../src/renderer/js/core/platba.js");
const vypocet = require("../src/renderer/js/core/vypocet.js");
const model = require("../src/renderer/js/core/model.js");
const dph = require("../src/renderer/js/core/dph.js");
const denik = require("../src/renderer/js/core/denik.js");
const csv = require("../src/renderer/js/core/csv.js");

/* Pomocná data — plátce DPH s jednou fakturou. */
function zakladniData() {
  const data = model.prazdnaData();
  data.nastaveni.firma.jmeno = "Jan Novák";
  data.nastaveni.firma.ico = "12345679";
  data.nastaveni.firma.dic = "CZ12345679";
  data.nastaveni.firma.plateceDph = true;
  data.nastaveni.banka.ucet = "19-2000145399/0800";
  return data;
}

function faktura(uprava) {
  const data = zakladniData();
  const f = model.novaFaktura(data, "faktura");
  f.cislo = "2026001";
  f.stav = "vystavena";
  f.polozky = [];
  if (uprava) uprava(f, data);
  return { f, data };
}

/* ---------------- zaokrouhlování ---------------- */

test("zaokrouhlení jde od nuly i u záporných částek", () => {
  assert.equal(util.zaokrouhli(2.225, 2), 2.23);
  assert.equal(util.zaokrouhli(-2.225, 2), -2.23);
  assert.equal(util.zaokrouhli(1.005, 2), 1.01);
  assert.equal(util.naKoruny(12100.5), 12101);
  assert.equal(util.naKoruny(-12100.5), -12101);
});

test("číslo se přečte i s mezerami a desetinnou čárkou", () => {
  assert.equal(util.cislo("1 234,50"), 1234.5);
  assert.equal(util.cislo("1 234,50"), 1234.5);
  assert.equal(util.cislo("nesmysl", 7), 7);
});

test("přičtení měsíce nepřeteče do dalšího měsíce", () => {
  assert.equal(util.pridejMesice("2026-01-31", 1), "2026-02-28");
  assert.equal(util.pridejMesice("2026-03-15", 3), "2026-06-15");
});

test("období čtvrtletí vrátí správné hranice", () => {
  assert.deepEqual(util.obdobi(2026, 1, "ctvrtleti"), { od: "2026-01-01", do: "2026-03-31" });
  assert.deepEqual(util.obdobi(2026, 4, "ctvrtleti"), { od: "2026-10-01", do: "2026-12-31" });
  assert.deepEqual(util.obdobi(2026, 2, "mesic"), { od: "2026-02-01", do: "2026-02-28" });
});

/* ---------------- validace ---------------- */

test("IČO se ověří kontrolní číslicí", () => {
  assert.equal(validace.platneIco("12345679"), true);
  assert.equal(validace.platneIco("27074358"), true);
  assert.equal(validace.platneIco("12345678"), false);
  assert.equal(validace.platneIco("1234567"), false);
});

test("číslo účtu se převede na IBAN", () => {
  assert.equal(validace.ucetNaIban("19-2000145399/0800"), "CZ6508000000192000145399");
  assert.equal(validace.platnyIban("CZ6508000000192000145399"), true);
  assert.equal(validace.platnyIban("CZ6508000000192000145398"), false);
  assert.equal(validace.ucetNaIban("nesmysl"), "");
});

test("kontrolní součet čísla účtu odhalí překlep", () => {
  assert.equal(validace.platnyUcet("19-2000145399/0800"), true);
  assert.equal(validace.platnyUcet("19-2000145398/0800"), false);
});

test("variabilní symbol se z čísla faktury zkrátí na deset číslic", () => {
  assert.equal(validace.vsZCisla("2026001"), "2026001");
  // Z čísla se vezmou všechny číslice bez oddělovačů.
  assert.equal(validace.vsZCisla("FA-2026-00123"), "202600123");
  // Delší číslo se ořízne zprava, aby se vešlo do deseti míst.
  assert.equal(validace.vsZCisla("123456789012"), "3456789012");
});

/* ---------------- QR platba ---------------- */

test("řetězec QR platby má předepsaný tvar", () => {
  const text = platba.retezecSpd({
    iban: "CZ6508000000192000145399",
    castka: 12100,
    vs: "2026001",
    splatnost: "2026-08-22",
    zprava: "Faktura 2026001",
  });
  assert.equal(
    text,
    "SPD*1.0*ACC:CZ6508000000192000145399*AM:12100.00*CC:CZK*DT:20260822*MSG:Faktura 2026001*X-VS:2026001"
  );
});

test("zpráva pro příjemce se zbaví diakritiky a hvězdiček", () => {
  const text = platba.retezecSpd({ iban: "CZ6508000000192000145399", castka: 100, zprava: "Příliš * žluťoučký" });
  assert.ok(text.includes("MSG:Prilis zlutoucky"));
  assert.equal(text.split("*").length, 6);
});

/* ---------------- výpočet dokladu ---------------- */

test("běžná faktura spočítá základ, daň a zaokrouhlení", () => {
  const { f, data } = faktura((f, data) => {
    f.polozky = [
      model.novaPolozka(data.nastaveni, { popis: "Práce", mnozstvi: 10, cenaZaMj: 1000, sazba: 21 }),
    ];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.zakladCelkem, 10000);
  assert.equal(v.dphCelkem, 2100);
  assert.equal(v.kUhrade, 12100);
  assert.equal(v.zaokrouhleni, 0);
});

test("daň se počítá ze součtu základů, ne z jednotlivých řádků", () => {
  // Tři řádky po 0,145 Kč: součet daní po řádcích by dal jiný haléř než daň ze součtu.
  const { f, data } = faktura((f, data) => {
    f.polozky = [1, 2, 3].map(() =>
      model.novaPolozka(data.nastaveni, { popis: "Drobnost", mnozstvi: 1, cenaZaMj: 33.33, sazba: 21 })
    );
    f.zaokrouhlit = false;
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.zakladCelkem, 99.99);
  assert.equal(v.dphCelkem, 21); // 99,99 * 0,21 = 20,9979 → 21,00
  assert.equal(v.kUhrade, 120.99);
});

test("zaokrouhlení na celé koruny se ukáže jako samostatný řádek", () => {
  const { f, data } = faktura((f, data) => {
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 999.9, sazba: 21 })];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.mezisoucet, 1209.88);
  assert.equal(v.zaokrouhleni, 0.12);
  assert.equal(v.kUhrade, 1210);
});

test("ceny zadané včetně DPH se rozpočítají zpět na základ", () => {
  const { f, data } = faktura((f, data) => {
    f.cenyVcetneDph = true;
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 12100, sazba: 21 })];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.zakladCelkem, 10000);
  assert.equal(v.dphCelkem, 2100);
  assert.equal(v.kUhrade, 12100);
});

test("sleva na dokladu se promítne do základu daně", () => {
  const { f, data } = faktura((f, data) => {
    f.slevaProc = 10;
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 10000, sazba: 21 })];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.zakladCelkem, 9000);
  assert.equal(v.dphCelkem, 1890);
});

test("přenesená daňová povinnost nevyčíslí žádnou daň", () => {
  const { f, data } = faktura((f, data) => {
    f.rezim = "prenesena";
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 50000, sazba: 21 })];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.dphCelkem, 0);
  assert.equal(v.kUhrade, 50000);
  assert.equal(v.bezDane, true);
});

test("neplátce DPH nevystavuje daň ani v běžném režimu", () => {
  const { f, data } = faktura((f, data) => {
    data.nastaveni.firma.plateceDph = false;
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 5000, sazba: 21 })];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.dphCelkem, 0);
  assert.equal(v.kUhrade, 5000);
});

test("dobropis má všechny částky záporné", () => {
  const { f, data } = faktura((f, data) => {
    f.typ = "dobropis";
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 10000, sazba: 21 })];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.zakladCelkem, -10000);
  assert.equal(v.dphCelkem, -2100);
  assert.equal(v.kUhrade, -12100);
});

test("odpočet zálohy sníží částku k úhradě", () => {
  const { f, data } = faktura((f, data) => {
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 100000, sazba: 21 })];
    f.odpocty = [{ popis: "Záloha", cislo: "Z2026001", castka: 60500 }];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.mezisoucet, 121000);
  assert.equal(v.odpocetCelkem, 60500);
  assert.equal(v.kUhrade, 60500);
});

test("dvě sazby na jedné faktuře se v rozpisu nesloučí", () => {
  const { f, data } = faktura((f, data) => {
    f.polozky = [
      model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 10000, sazba: 21 }),
      model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 2000, sazba: 12 }),
    ];
  });
  const v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(v.sazby.length, 2);
  assert.equal(v.sazby[0].sazba, 21);
  assert.equal(v.sazby[0].dph, 2100);
  assert.equal(v.sazby[1].sazba, 12);
  assert.equal(v.sazby[1].dph, 240);
  assert.equal(v.kUhrade, 14340);
});

/* ---------------- stav faktury ---------------- */

test("stav faktury se řídí úhradami a splatností", () => {
  const { f, data } = faktura((f, data) => {
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 10000, sazba: 21 })];
    f.datumSplatnosti = "2026-01-15";
  });
  const nastaveni = data.nastaveni;

  let v = vypocet.vypocetDokladu(f, nastaveni);
  assert.equal(vypocet.stavDokladu(f, v, "2026-01-10"), "vystavena");
  assert.equal(vypocet.stavDokladu(f, v, "2026-02-01"), "poSplatnosti");

  f.uhrady = [{ datum: "2026-01-10", castka: 5000 }];
  v = vypocet.vypocetDokladu(f, nastaveni);
  assert.equal(vypocet.stavDokladu(f, v, "2026-01-10"), "castecne");

  f.uhrady.push({ datum: "2026-01-12", castka: 7100 });
  v = vypocet.vypocetDokladu(f, nastaveni);
  assert.equal(vypocet.stavDokladu(f, v, "2026-02-01"), "zaplacena");
  assert.equal(vypocet.datumZaplaceni(f, v), "2026-01-12");
});

test("koncept a storno zůstávají ve svém stavu bez ohledu na splatnost", () => {
  const { f, data } = faktura((f, data) => {
    f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 1000, sazba: 21 })];
    f.datumSplatnosti = "2020-01-01";
  });
  f.stav = "koncept";
  let v = vypocet.vypocetDokladu(f, data.nastaveni);
  assert.equal(vypocet.stavDokladu(f, v, "2026-01-01"), "koncept");
  f.stav = "stornovana";
  assert.equal(vypocet.stavDokladu(f, v, "2026-01-01"), "stornovana");
});

/* ---------------- číslování ---------------- */

test("další číslo dokladu naváže na nejvyšší vydané v roce", () => {
  const data = zakladniData();
  assert.equal(model.dalsiCislo(data, "faktura", "2026-03-01"), "2026001");

  data.faktury.push({ typ: "faktura", cislo: "2026001", datumVystaveni: "2026-01-05", polozky: [] });
  data.faktury.push({ typ: "faktura", cislo: "2026007", datumVystaveni: "2026-02-05", polozky: [] });
  assert.equal(model.dalsiCislo(data, "faktura", "2026-03-01"), "2026008");

  // Doklad z jiného roku řadu neovlivní.
  data.faktury.push({ typ: "faktura", cislo: "2025099", datumVystaveni: "2025-12-05", polozky: [] });
  assert.equal(model.dalsiCislo(data, "faktura", "2026-03-01"), "2026008");
  assert.equal(model.dalsiCislo(data, "faktura", "2027-01-02"), "2027001");
});

test("vzor čísla umí rok, měsíc i délku pořadí", () => {
  assert.equal(model.sestavCislo("{RRRR}{NNN}", 8, "2026-05-01"), "2026008");
  assert.equal(model.sestavCislo("FA-{RR}{MM}-{NNNN}", 12, "2026-05-01"), "FA-2605-0012");
  assert.equal(model.poradiZCisla("FA-2605-0012", "FA-{RR}{MM}-{NNNN}", "2026-05-01"), 12);
});

/* ---------------- DPH ---------------- */

test("přehled DPH sečte výstup i odpočet a určí výsledek", () => {
  const data = zakladniData();
  const f = model.novaFaktura(data, "faktura");
  f.cislo = "2026001";
  f.stav = "vystavena";
  f.duzp = "2026-03-10";
  f.odberatel.dic = "CZ27074358";
  f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 100000, sazba: 21 })];
  data.faktury.push(f);

  const v = model.novyVydaj();
  v.duzp = "2026-03-15";
  v.datumUhrady = "2026-03-15";
  v.dodavatel = { jmeno: "Dodavatel s.r.o.", ico: "27074358", dic: "CZ27074358" };
  v.zaklady = [{ sazba: 21, zaklad: 20000, dph: 4200 }];
  data.vydaje.push(v);

  const prehled = dph.prehledDph(data, "2026-03-01", "2026-03-31");
  assert.equal(prehled.vystup.r1.zaklad, 100000);
  assert.equal(prehled.vystup.r1.dan, 21000);
  assert.equal(prehled.vstup.r40.dan, 4200);
  assert.equal(prehled.danNaVystupu, 21000);
  assert.equal(prehled.odpocet, 4200);
  assert.equal(prehled.vysledek, 16800);
  assert.equal(prehled.jeNadmernyOdpocet, false);
});

test("koncept ani zálohová faktura do DPH nevstupují", () => {
  const data = zakladniData();
  const koncept = model.novaFaktura(data, "faktura");
  koncept.duzp = "2026-03-10";
  koncept.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 50000, sazba: 21 })];
  koncept.stav = "koncept";

  const zaloha = model.novaFaktura(data, "zaloha");
  zaloha.duzp = "2026-03-11";
  zaloha.stav = "vystavena";
  zaloha.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 50000, sazba: 21 })];

  data.faktury.push(koncept, zaloha);
  const prehled = dph.prehledDph(data, "2026-03-01", "2026-03-31");
  assert.equal(prehled.vystup.r1.zaklad, 0);
  assert.equal(prehled.danNaVystupu, 0);
});

test("krácený odpočet sníží nárok i zvýší daňový náklad", () => {
  const v = model.novyVydaj();
  v.zaklady = [{ sazba: 21, zaklad: 10000, dph: 2100 }];
  v.pomerOdpoctu = 50;
  const rozpis = dph.rozpisVydaje(v);
  assert.equal(rozpis.dphCelkem, 2100);
  assert.equal(rozpis.odpocetCelkem, 1050);
  // Do výdajů jde základ plus neuplatněná polovina daně.
  assert.equal(rozpis.danovyNaklad, 11050);
});

test("kontrolní hlášení rozdělí doklady podle limitu deset tisíc", () => {
  const data = zakladniData();

  const velka = model.novaFaktura(data, "faktura");
  velka.cislo = "2026001";
  velka.stav = "vystavena";
  velka.duzp = "2026-03-10";
  velka.odberatel = Object.assign(model.prazdnyKlient(), { jmeno: "Plátce a.s.", dic: "CZ27074358" });
  velka.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 100000, sazba: 21 })];

  const mala = model.novaFaktura(data, "faktura");
  mala.cislo = "2026002";
  mala.stav = "vystavena";
  mala.duzp = "2026-03-12";
  mala.odberatel = Object.assign(model.prazdnyKlient(), { jmeno: "Občan", dic: "" });
  mala.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 1000, sazba: 21 })];

  data.faktury.push(velka, mala);
  const kh = dph.kontrolniHlaseni(data, "2026-03-01", "2026-03-31");

  assert.equal(kh.A4.length, 1);
  assert.equal(kh.A4[0].cislo, "2026001");
  assert.equal(kh.A4[0].dan21, 21000);
  assert.equal(kh.A5.zaklad21, 1000);
  assert.equal(kh.A5.dan21, 210);
});

test("plnění v přenesené povinnosti jde do oddílu A.1", () => {
  const data = zakladniData();
  const f = model.novaFaktura(data, "faktura");
  f.cislo = "2026003";
  f.stav = "vystavena";
  f.duzp = "2026-03-20";
  f.rezim = "prenesena";
  f.odberatel = Object.assign(model.prazdnyKlient(), { jmeno: "Stavby s.r.o.", dic: "CZ27074358" });
  f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 300000, sazba: 21 })];
  data.faktury.push(f);

  const kh = dph.kontrolniHlaseni(data, "2026-03-01", "2026-03-31");
  assert.equal(kh.A1.length, 1);
  assert.equal(kh.A1[0].zaklad, 300000);
  assert.equal(kh.A4.length, 0);

  const prehled = dph.prehledDph(data, "2026-03-01", "2026-03-31");
  assert.equal(prehled.vystup.r25.zaklad, 300000);
  assert.equal(prehled.danNaVystupu, 0);
});

/* ---------------- peněžní deník ---------------- */

test("příjem se do deníku zapíše ke dni úhrady, ne vystavení", () => {
  const data = zakladniData();
  const f = model.novaFaktura(data, "faktura");
  f.cislo = "2025120";
  f.stav = "vystavena";
  f.datumVystaveni = "2025-12-20";
  f.duzp = "2025-12-20";
  f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 100000, sazba: 21 })];
  f.uhrady = [{ datum: "2026-01-08", castka: 121000, zpusob: "prevodem" }];
  data.faktury.push(f);

  assert.equal(denik.polozkyDeniku(data, "2025-01-01", "2025-12-31").length, 0);

  const polozky = denik.polozkyDeniku(data, "2026-01-01", "2026-12-31");
  assert.equal(polozky.length, 1);
  assert.equal(polozky[0].datum, "2026-01-08");
  assert.equal(polozky[0].castka, 121000);
  // Do základu daně z příjmů jde částka bez DPH.
  assert.equal(polozky[0].doZakladuDane, 100000);
});

test("částečná úhrada se rozdělí na základ a daň ve stejném poměru", () => {
  const data = zakladniData();
  const f = model.novaFaktura(data, "faktura");
  f.cislo = "2026010";
  f.stav = "vystavena";
  f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 100000, sazba: 21 })];
  f.uhrady = [{ datum: "2026-05-01", castka: 60500 }];
  data.faktury.push(f);

  const polozky = denik.polozkyDeniku(data, "2026-01-01", "2026-12-31");
  assert.equal(polozky[0].doZakladuDane, 50000);
  assert.equal(polozky[0].dph, 10500);
});

test("souhrn deníku spočítá základ daně z příjmů", () => {
  const data = zakladniData();
  const f = model.novaFaktura(data, "faktura");
  f.cislo = "2026001";
  f.stav = "vystavena";
  f.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 200000, sazba: 21 })];
  f.uhrady = [{ datum: "2026-02-10", castka: 242000 }];
  data.faktury.push(f);

  const naklad = model.novyVydaj();
  naklad.datumUhrady = "2026-02-20";
  naklad.kategorie = "material";
  naklad.zaklady = [{ sazba: 21, zaklad: 50000, dph: 10500 }];
  data.vydaje.push(naklad);

  // Odvod sociálního pojištění je výdaj peněz, ale ne daňový náklad.
  const socialni = model.novyVydaj();
  socialni.datumUhrady = "2026-02-25";
  socialni.kategorie = "socialni";
  socialni.danovyVydaj = false;
  socialni.odpocetDph = false;
  socialni.zaklady = [{ sazba: 0, zaklad: 8000, dph: 0 }];
  data.vydaje.push(socialni);

  const souhrn = denik.souhrn(denik.polozkyDeniku(data, "2026-01-01", "2026-12-31"));
  assert.equal(souhrn.prijmyCelkem, 242000);
  assert.equal(souhrn.vydajeCelkem, 68500);
  assert.equal(souhrn.prijmyDoZakladu, 200000);
  assert.equal(souhrn.vydajeDoZakladu, 50000);
  assert.equal(souhrn.zakladDane, 150000);
});

test("pohledávky ukážou jen neuhrazené faktury", () => {
  const data = zakladniData();
  const zaplacena = model.novaFaktura(data, "faktura");
  zaplacena.cislo = "2026001";
  zaplacena.stav = "vystavena";
  zaplacena.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 10000, sazba: 21 })];
  zaplacena.uhrady = [{ datum: "2026-01-20", castka: 12100 }];

  const dluh = model.novaFaktura(data, "faktura");
  dluh.cislo = "2026002";
  dluh.stav = "vystavena";
  dluh.datumSplatnosti = "2026-01-15";
  dluh.polozky = [model.novaPolozka(data.nastaveni, { mnozstvi: 1, cenaZaMj: 20000, sazba: 21 })];

  data.faktury.push(zaplacena, dluh);
  const seznam = denik.pohledavky(data, "2026-02-01");
  assert.equal(seznam.length, 1);
  assert.equal(seznam[0].faktura.cislo, "2026002");
  assert.equal(seznam[0].zbyva, 24200);
  assert.equal(seznam[0].poSplatnosti, 17);
});

/* ---------------- CSV ---------------- */

test("CSV má BOM, středníky a desetinnou čárku", () => {
  const text = csv.sestav(["Číslo", "Částka"], [["2026001", 12100.5]]);
  assert.ok(text.startsWith("﻿"));
  assert.ok(text.includes("Číslo;Částka"));
  assert.ok(text.includes("2026001;12100,5"));
});

test("CSV uzavře hodnotu se středníkem do uvozovek", () => {
  const text = csv.sestav(["Popis"], [['Práce; oprava "stroje"']]);
  assert.ok(text.includes('"Práce; oprava ""stroje"""'));
});
