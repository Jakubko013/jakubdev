# Desktopová verze — ISO.Paneels Cenové nabídky

Zdroj programu pro Windows (`ISO-Paneels-Nabidky.exe`). Aplikace samotná je
`../nabidky.html`; tenhle program ji jen zabalí dovnitř sebe, vystaví na
`http://127.0.0.1:8747` a otevře v okně bez lišty prohlížeče.

## Sestavení

```sh
python3 build.py                       # z ../nabidky.html vyrobí app/ a zálohu .html
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 \
  go build -ldflags="-s -w -H=windowsgui" -o ISO-Paneels-Nabidky.exe .
```

`build.py` sestaví čtyři podoby z jednoho zdroje:

| výstup | k čemu |
|---|---|
| `netlify/` | web s PWA (instalace do telefonu i počítače) |
| `app/` | obsah zabalený do .exe (bez service workeru) |
| `artifact.html` | náhled bez AI (sandbox artifactů nepustí volání ven) |
| `ISO-Paneels-Nabidky.html` | záloha k dvojkliku, celá aplikace v jednom souboru |

## Proč pevný port

Ceník, údaje dodavatele i uložené nabídky žijí v `localStorage` prohlížeče,
a ten je vázaný na adresu. Kdyby si program bral volný port, po každém
spuštění by aplikace přišla o data.

## Když se okno neotevře

Program nesmí nikdy skončit potichu — uživatel po dvojkliku nevidí konzoli.
Každá slepá ulička proto končí systémovým oknem se zprávou a aplikace se
otevře alespoň v běžném prohlížeči:

- nenašel se Edge ani Chrome
- prohlížeč se nepodařilo spustit
- okno zmizelo do tří vteřin (zamčený profil, blokace firemní politikou)

Průběh spuštění se zapisuje do `%LOCALAPPDATA%\ISO-Paneels-Nabidky\protokol.txt`.

## Podpis

Program není podepsaný certifikátem, takže Windows u staženého souboru ukáže
modré okno „Systém Windows ochránil váš počítač“ → *Další informace* →
*Přesto spustit*. Odstranit to jde jen zakoupeným code-signing certifikátem.
