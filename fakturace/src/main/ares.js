"use strict";

/* Načtení firmy z registru ARES podle IČO.

   Veřejné REST rozhraní Ministerstva financí:
   https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}

   Je to jediné místo, kde aplikace chodí na internet, a vždy jen na výslovné
   kliknutí uživatele. Bez připojení se prostě jen nic nedoplní. */

const URL_ARES = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/";
const TIMEOUT_MS = 12000;

async function najdiPodleIco(ico) {
  const cistecIco = String(ico || "").replace(/\D/g, "");
  if (cistecIco.length !== 8) {
    return { ok: false, chyba: "IČO musí mít 8 číslic." };
  }

  const prerus = new AbortController();
  const casovac = setTimeout(() => prerus.abort(), TIMEOUT_MS);
  try {
    const odpoved = await fetch(URL_ARES + cistecIco, {
      signal: prerus.signal,
      headers: { accept: "application/json" },
    });
    if (odpoved.status === 404) {
      return { ok: false, chyba: `Subjekt s IČO ${cistecIco} nebyl v ARESu nalezen.` };
    }
    if (!odpoved.ok) {
      return { ok: false, chyba: `ARES odpověděl chybou ${odpoved.status}.` };
    }
    const data = await odpoved.json();
    return { ok: true, firma: prevedSubjekt(data) };
  } catch (err) {
    if (err.name === "AbortError") {
      return { ok: false, chyba: "ARES neodpověděl včas. Zkuste to prosím znovu." };
    }
    return { ok: false, chyba: "Nepodařilo se spojit s ARESem: " + err.message };
  } finally {
    clearTimeout(casovac);
  }
}

/** Z odpovědi ARESu vybere jen to, co aplikace potřebuje. */
function prevedSubjekt(data) {
  const sidlo = data.sidlo || {};
  return {
    jmeno: data.obchodniJmeno || "",
    ico: data.ico || "",
    dic: data.dic || "",
    ulice: sestavUlici(sidlo),
    mesto: sidlo.nazevObce || "",
    psc: sidlo.psc ? formatPsc(sidlo.psc) : "",
    zeme: sidlo.nazevStatu || "Česká republika",
  };
}

function sestavUlici(sidlo) {
  const ulice = sidlo.nazevUlice || sidlo.nazevCastiObce || sidlo.nazevObce || "";
  const cisloDomovni = sidlo.cisloDomovni != null ? String(sidlo.cisloDomovni) : "";
  const cisloOrientacni =
    sidlo.cisloOrientacni != null
      ? String(sidlo.cisloOrientacni) + (sidlo.cisloOrientacniPismeno || "")
      : "";
  let cislo = cisloDomovni;
  if (cisloDomovni && cisloOrientacni) cislo = `${cisloDomovni}/${cisloOrientacni}`;
  else if (!cisloDomovni && cisloOrientacni) cislo = cisloOrientacni;
  return [ulice, cislo].filter(Boolean).join(" ").trim();
}

function formatPsc(psc) {
  const c = String(psc).replace(/\D/g, "");
  return c.length === 5 ? `${c.slice(0, 3)} ${c.slice(3)}` : String(psc);
}

module.exports = { najdiPodleIco };
