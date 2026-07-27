#!/usr/bin/env python3
"""Sestaví čtyři podoby aplikace z jednoho zdroje (../nabidky.html).

  netlify/  — samostatný web pro Netlify (index.html + PWA)
  app/      — obsah zabalený do .exe (bez service workeru a manifestu)
  artifact.html — náhled do artifactu (systémová písma, logo v souboru, AI vypnuté)
  ISO-Paneels-Nabidky.html — záloha k dvojkliku, všechno v jednom souboru
"""
import base64
import pathlib
import re
import shutil

SRC = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(__file__).resolve().parent
source = (SRC / "nabidky.html").read_text(encoding="utf-8")


def strip_pwa(html: str) -> str:
    """Vypne registraci service workeru a instalační tlačítko."""
    html = html.replace('<link rel="manifest" href="manifest.webmanifest">\n', "")
    html = html.replace("  initPWA();\n", "")
    html = re.sub(
        r'\s*<button class="btn btn-ghost btn-sm" id="btnInstall"[^>]*>[^<]*</button>',
        "", html)
    # tlačítko se v kódu ještě obsluhuje — nahradit voláním, které nic nedělá
    html = html.replace('$("btnInstall").style.display', '(window.__noop||{}).display')
    return html


def system_fonts(html: str) -> str:
    """Artifact nesmí stahovat písma zvenčí (blokuje to bezpečnostní politika)."""
    html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
    html = re.sub(r'\s*<link href="https://fonts\.googleapis\.com[^>]*>', "", html)
    html = html.replace("'Poppins','Segoe UI',system-ui,sans-serif", "'Segoe UI',system-ui,sans-serif")
    html = html.replace("'Inter','Segoe UI',system-ui,sans-serif", "'Segoe UI',system-ui,sans-serif")
    return html


def inline_icon(html: str) -> str:
    """Ikonu záložky vloží dovnitř — jinak ji sestavení bez vedlejších souborů nenajde."""
    data = base64.b64encode((SRC / "icon-192.png").read_bytes()).decode()
    return html.replace('href="icon-192.png"', 'href="data:image/png;base64,' + data + '"')


def inline_logo(html: str) -> str:
    data = base64.b64encode((SRC / "logo-isopaneels.png").read_bytes()).decode()
    return html.replace('const DEFAULT_LOGO = "logo-isopaneels.png";',
                        'const DEFAULT_LOGO = "data:image/png;base64,' + data + '";')


# ---------- 1) samostatný web pro Netlify ----------
netlify = OUT / "netlify"
shutil.rmtree(netlify, ignore_errors=True)
netlify.mkdir()
(netlify / "index.html").write_text(source, encoding="utf-8")
for name in ("logo-isopaneels.png", "icon-192.png", "icon-512.png"):
    shutil.copy(SRC / name, netlify / name)
manifest = (SRC / "manifest.webmanifest").read_text(encoding="utf-8")
manifest = manifest.replace('"./nabidky.html"', '"./"')
(netlify / "manifest.webmanifest").write_text(manifest, encoding="utf-8")
sw = (SRC / "sw.js").read_text(encoding="utf-8")
sw = sw.replace('"./nabidky.html",', '"./",\n  "./index.html",')
(netlify / "sw.js").write_text(sw, encoding="utf-8")

# ---------- 2) obsah pro desktopovou aplikaci ----------
desktop = OUT / "app"
desktop.mkdir(parents=True, exist_ok=True)
(desktop / "index.html").write_text(inline_icon(strip_pwa(source)), encoding="utf-8")
shutil.copy(SRC / "logo-isopaneels.png", desktop / "logo-isopaneels.png")

# ---------- 3) náhled do artifactu ----------
art = source
title = re.search(r"<title>.*?</title>", art).group(0)
style = art[art.index("<style>"): art.index("</style>") + len("</style>")]
body = art[art.index("<body>") + len("<body>"): art.index("</body>")]
art = title + "\n" + style + "\n" + body
art = strip_pwa(art)
art = system_fonts(art)
art = inline_logo(art)
art = art.replace(
    "async function claudeRequest(body) {\n  const key",
    'async function claudeRequest(body) {\n'
    '  throw new Error("AI agent v tomto náhledu nefunguje — sandbox artifactů nepouští '
    'požadavky na Claude API. V nasazené aplikaci a v desktopové verzi funguje normálně.");\n'
    "  const key", 1)
art = art.replace(
    '<nav class="tabs">',
    '<p class="preview-note">Náhled aplikace — ostrá verze běží na webu a jako program pro Windows. '
    'Funguje tu všechno kromě tří AI tlačítek (sandbox artifactů nepouští volání Claude API ven).</p>\n'
    '    <nav class="tabs">', 1)
art = art.replace(
    "  .tabs{display:flex;",
    "  .preview-note{width:100%;border:1px dashed var(--blue);border-radius:9px;padding:9px 13px;"
    "background:var(--blue-soft);color:var(--ink);font-size:.8rem;line-height:1.45;margin-top:10px;}\n"
    "  .tabs{display:flex;", 1)
(OUT / "artifact.html").write_text(art, encoding="utf-8")

# ---------- 4) záložní soubor k dvojkliku (bez instalace, bez .exe) ----------
# Kdyby .exe zablokoval SmartScreen nebo antivirus, tenhle soubor projde vždy:
# je to obyčejná stránka, jen má logo i všechen kód uvnitř sebe.
offline = inline_icon(inline_logo(strip_pwa(source)))
(OUT / "ISO-Paneels-Nabidky.html").write_text(offline, encoding="utf-8")

# ---------- kontrola ----------
checks = {
    "záloha má logo v souboru": "data:image/png;base64," in offline,
    "záloha bez service workeru": "initPWA();" not in offline,
    "záloha má AI zapnuté": "sandbox artifactů" not in offline,
    "záloha je jeden soubor": "logo-isopaneels.png" not in offline and "icon-192.png" not in offline,
    "netlify/index.html má PWA": 'initPWA();' in (netlify / "index.html").read_text(encoding="utf-8"),
    "desktop bez service workeru": "initPWA();" not in (desktop / "index.html").read_text(encoding="utf-8"),
    "artifact má logo v souboru": "data:image/png;base64," in art,
    "artifact bez Google Fonts": "fonts.googleapis" not in art,
    "artifact má vypnuté AI": "sandbox artifactů" in art,
    "artifact má jeden <style>": art.count("<style>") == 1 and art.count("</style>") == 1,
    "artifact má hlavičku": '<header class="topbar">' in art,
}
for k, v in checks.items():
    print(("  OK  " if v else " CHYBA ") + k)
if not all(checks.values()):
    raise SystemExit("build selhal")
print("\nsestaveno:", netlify, desktop, OUT / "artifact.html")
