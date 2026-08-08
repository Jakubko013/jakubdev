"use strict";

/* Ukázková data pro test průchodu aplikací.

   Nejde o součást aplikace — slouží jen k tomu, aby snímky obrazovek
   ukázaly vyplněné tabulky a aby se prošly i méně obvyklé případy
   (částečná úhrada, faktura po splatnosti, dobropis, přenesená povinnost). */

const util = require("../src/renderer/js/core/util.js");
const model = require("../src/renderer/js/core/model.js");
const vypocet = require("../src/renderer/js/core/vypocet.js");

/**
 * @param {{plateceDph?: boolean}} volby Ukázka se staví v obou režimech,
 *   aby průchod ověřil i podobu aplikace pro neplátce DPH.
 */
function demoData(volby) {
  const plateceDph = !!(volby && volby.plateceDph);
  const data = model.prazdnaData();

  Object.assign(data.nastaveni.firma, {
    jmeno: "Jan Novák",
    ico: "12345679",
    dic: plateceDph ? "CZ12345679" : "",
    plateceDph,
    ulice: "Dlouhá 128/14",
    mesto: "Brno",
    psc: "602 00",
    tel: "+420 777 123 456",
    email: "jan@novak.cz",
    web: "novak.cz",
    rejstrik: "Zapsáno v živnostenském rejstříku, ÚMČ Brno-střed.",
  });
  Object.assign(data.nastaveni.banka, {
    ucet: "19-2000145399/0800",
    banka: "Česká spořitelna, a.s.",
  });

  const klienti = [
    {
      jmeno: "Stavební firma Horák s.r.o.",
      ico: "27074358",
      dic: "CZ27074358",
      ulice: "Průmyslová 1245",
      mesto: "Brno",
      psc: "612 00",
      email: "fakturace@horak-stavby.cz",
    },
    {
      jmeno: "Marie Dvořáková",
      ico: "",
      dic: "",
      ulice: "Nová 12",
      mesto: "Kuřim",
      psc: "664 34",
      email: "m.dvorakova@email.cz",
    },
    {
      jmeno: "TechnoData a.s.",
      ico: "45274649",
      dic: "CZ45274649",
      ulice: "Vídeňská 995/63",
      mesto: "Brno",
      psc: "639 00",
      email: "ucetni@technodata.cz",
      vychoziSplatnost: 30,
    },
    {
      jmeno: "Pekárna U Mlýna s.r.o.",
      ico: "26918151",
      dic: "CZ26918151",
      ulice: "Mlýnská 8",
      mesto: "Blansko",
      psc: "678 01",
      email: "info@umlyna.cz",
    },
  ].map((k) => model.novyKlient(k));
  data.klienti = klienti;

  const dnes = util.dnesISO();
  const polozka = (popis, mnozstvi, jednotka, cena, sazba) =>
    model.novaPolozka(data.nastaveni, { popis, mnozstvi, jednotka, cenaZaMj: cena, sazba: sazba == null ? 21 : sazba });

  /** Vytvoří fakturu s posunem dnů proti dnešku. */
  function faktura(nastaveniFaktury) {
    const f = model.novaFaktura(data, nastaveniFaktury.typ || "faktura");
    const vystaveno = util.pridejDny(dnes, nastaveniFaktury.predDny * -1);
    f.datumVystaveni = vystaveno;
    f.duzp = vystaveno;
    f.datumSplatnosti = util.pridejDny(vystaveno, nastaveniFaktury.splatnost || 14);
    f.klientId = nastaveniFaktury.klient.id;
    f.odberatel = util.kopie(nastaveniFaktury.klient);
    f.polozky = nastaveniFaktury.polozky;
    f.stav = nastaveniFaktury.stav || "vystavena";
    if (nastaveniFaktury.rezim && plateceDph) f.rezim = nastaveniFaktury.rezim;
    if (nastaveniFaktury.poznamka) f.poznamka = nastaveniFaktury.poznamka;
    if (nastaveniFaktury.uhrady) {
      /* Ukázkové úhrady jsou zadané jako podíl z celkové částky, aby seděly
         v obou režimech — u neplátce je faktura nižší o daň. */
      const celkem = vypocet.vypocetDokladu(f, data.nastaveni).kUhrade;
      f.uhrady = nastaveniFaktury.uhrady.map((u) => ({
        datum: u.datum,
        zpusob: u.zpusob,
        castka: u.podil ? util.naKoruny(celkem * u.podil) : u.castka,
      }));
    }
    if (f.stav !== "koncept") {
      f.cislo = model.dalsiCislo(data, f.typ, f.datumVystaveni);
      f.vs = f.cislo.replace(/\D/g, "").slice(-10);
    }
    data.faktury.push(f);
    return f;
  }

  faktura({
    klient: klienti[2],
    predDny: 96,
    splatnost: 30,
    polozky: [
      polozka("Vývoj interní aplikace — analýza a návrh", 62, "hod", 1250),
      polozka("Konzultace k datové migraci", 8, "hod", 1500),
    ],
    uhrady: [{ datum: util.pridejDny(dnes, -70), podil: 0.985, zpusob: "prevodem" }],
  });

  faktura({
    klient: klienti[0],
    predDny: 64,
    polozky: [
      polozka("Zpracování projektové dokumentace haly", 1, "soubor", 148000),
      polozka("Zaměření stavby vč. dopravy", 2, "den", 9800),
    ],
    uhrady: [{ datum: util.pridejDny(dnes, -52), podil: 1, zpusob: "prevodem" }],
  });

  // Faktura po splatnosti — kvůli obrazovce upomínek.
  const dluh = faktura({
    klient: klienti[3],
    predDny: 51,
    polozky: [
      polozka("Servisní zásah — chladicí jednotka", 6, "hod", 890),
      polozka("Náhradní díly dle přílohy", 1, "soubor", 12480),
    ],
  });
  dluh.upominky = [
    { datum: util.pridejDny(dnes, -14), poradi: 1, text: "První upomínka odeslána e-mailem." },
  ];

  // Částečně uhrazená faktura.
  faktura({
    klient: klienti[2],
    predDny: 24,
    splatnost: 30,
    polozky: [
      polozka("Programátorské práce — sprint 14", 74, "hod", 1250),
      polozka("Provoz a dohled nad aplikací", 1, "měsíc", 8500),
    ],
    uhrady: [{ datum: util.pridejDny(dnes, -6), podil: 0.49, zpusob: "prevodem" }],
  });

  // Přenesená daňová povinnost — stavební práce mezi plátci.
  faktura({
    klient: klienti[0],
    predDny: 17,
    rezim: "prenesena",
    polozky: [polozka("Montážní práce na stavbě Modřice", 118, "hod", 640)],
  });

  faktura({
    klient: klienti[1],
    predDny: 9,
    polozky: [
      polozka("Oprava a seřízení oken", 4, "hod", 750),
      polozka("Těsnění a kování", 1, "soubor", 2340, 12),
    ],
    uhrady: [{ datum: util.pridejDny(dnes, -7), podil: 1, zpusob: "hotove" }],
  });

  // Zálohová faktura a koncept.
  faktura({
    klient: klienti[0],
    typ: "zaloha",
    predDny: 5,
    polozky: [polozka("Záloha na dodávku a montáž vrat", 1, "soubor", 90000)],
  });

  faktura({
    klient: klienti[3],
    predDny: 1,
    stav: "koncept",
    polozky: [polozka("Pravidelná údržba technologie", 1, "měsíc", 14500)],
  });

  /* ---------------- výdaje ---------------- */

  const vydaj = (uprava) => {
    const v = model.novyVydaj();
    Object.assign(v, uprava);
    v.duzp = v.datumVystaveni;
    if (!plateceDph) {
      // Neplátce si daň nenárokuje, celá zaplacená částka je jeho výdaj.
      v.zaklady = v.zaklady.map((r) => ({
        sazba: 0,
        zaklad: util.zaokrouhli(util.cislo(r.zaklad) + util.cislo(r.dph), 2),
        dph: 0,
      }));
      v.rezim = "bezDph";
      v.odpocetDph = false;
      v.pomerOdpoctu = 0;
    }
    data.vydaje.push(v);
    return v;
  };

  vydaj({
    cisloDokladu: "2026-004512",
    dodavatel: { jmeno: "Velkoobchod Materiál s.r.o.", ico: "26918151", dic: "CZ26918151" },
    popis: "Spojovací materiál a kotvicí technika",
    kategorie: "material",
    datumVystaveni: util.pridejDny(dnes, -58),
    datumUhrady: util.pridejDny(dnes, -55),
    zaklady: [{ sazba: 21, zaklad: 34820, dph: 7312.2 }],
  });

  vydaj({
    cisloDokladu: "FV-2026-118",
    dodavatel: { jmeno: "Subdodávky Malý s.r.o.", ico: "27074358", dic: "CZ27074358" },
    popis: "Subdodávka elektroinstalace",
    kategorie: "sluzby",
    datumVystaveni: util.pridejDny(dnes, -40),
    datumUhrady: util.pridejDny(dnes, -33),
    zaklady: [{ sazba: 21, zaklad: 62000, dph: 13020 }],
  });

  vydaj({
    typ: "paragon",
    cisloDokladu: "PHM 03/26",
    dodavatel: { jmeno: "Čerpací stanice", ico: "", dic: "" },
    popis: "Pohonné hmoty — služební vůz",
    kategorie: "doprava",
    datumVystaveni: util.pridejDny(dnes, -22),
    datumUhrady: util.pridejDny(dnes, -22),
    pomerOdpoctu: 80,
    zaklady: [{ sazba: 21, zaklad: 8264.46, dph: 1735.54 }],
  });

  vydaj({
    cisloDokladu: "SW-99215",
    dodavatel: { jmeno: "Software licence s.r.o.", ico: "45274649", dic: "CZ45274649" },
    popis: "Roční licence návrhového software",
    kategorie: "software",
    datumVystaveni: util.pridejDny(dnes, -15),
    datumUhrady: util.pridejDny(dnes, -15),
    zaklady: [{ sazba: 21, zaklad: 24000, dph: 5040 }],
  });

  // Nedaňový pohyb — peníze z podnikání odešly, základ daně nesnižují.
  vydaj({
    typ: "interni",
    cisloDokladu: "VBU 03/2026",
    dodavatel: { jmeno: "", ico: "", dic: "" },
    popis: "Převod na soukromý účet",
    kategorie: "osobni",
    datumVystaveni: util.pridejDny(dnes, -12),
    datumUhrady: util.pridejDny(dnes, -12),
    danovyVydaj: false,
    odpocetDph: false,
    rezim: "bezDph",
    zaklady: [{ sazba: 0, zaklad: 25000, dph: 0 }],
  });

  // Nezaplacený závazek.
  vydaj({
    cisloDokladu: "FV-2026-341",
    dodavatel: { jmeno: "Nájem kanceláří a.s.", ico: "26918151", dic: "CZ26918151" },
    popis: "Nájemné a služby za tento měsíc",
    kategorie: "najem",
    datumVystaveni: util.pridejDny(dnes, -4),
    datumSplatnosti: util.pridejDny(dnes, 10),
    datumUhrady: "",
    zaplaceno: false,
    zaklady: [{ sazba: 21, zaklad: 18500, dph: 3885 }],
  });

  /* ---------------- opakovaná faktura ---------------- */

  const sablona = model.novaSablona();
  Object.assign(sablona, {
    nazev: "Provoz a dohled — TechnoData",
    klientId: klienti[2].id,
    interval: "mesic",
    dalsiVystaveni: util.pridejDny(dnes, -2),
    predloha: {
      polozky: [polozka("Provoz a dohled nad aplikací", 1, "měsíc", 8500)],
      splatnostDni: 30,
      textPredPolozkami: "Fakturujeme Vám na základě smlouvy o provozu:",
      poznamka: "",
      rezim: "bezny",
      cenyVcetneDph: false,
    },
  });
  data.sablony.push(sablona);

  return data;
}

module.exports = { demoData };
