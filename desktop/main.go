// ISO.Paneels — Cenové nabídky
//
// Samostatná aplikace pro Windows. Celý obsah aplikace je zabalený uvnitř
// tohoto souboru; program ho vystaví na místní adrese a otevře v samostatném
// okně bez lišty prohlížeče. Nic se neinstaluje a nikam se nic neodesílá
// kromě volání Claude API, které si vyžádá sám uživatel.
package main

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

//go:embed app
var appFiles embed.FS

const (
	// Pevný port — adresa aplikace se nesmí mezi spuštěními měnit, jinak by
	// prohlížeč nenašel dříve uložený ceník a údaje dodavatele.
	addr   = "127.0.0.1:8747"
	appURL = "http://" + addr + "/"
	marker = "iso-paneels-nabidky"
)

func main() {
	logf("--- spuštění %s ---", time.Now().Format("2006-01-02 15:04:05"))

	// Už jedna instance běží? Jen otevřít další okno a skončit.
	if alreadyRunning() {
		logf("aplikace už běží, otevírám další okno")
		if cmd, _ := openWindow(); cmd != nil {
			cmd.Wait()
		} else {
			openInDefaultBrowser()
		}
		return
	}

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		logf("port obsazený: %v", err)
		alert("Aplikaci se nepodařilo spustit — port 8747 je obsazený jiným programem.\n\n" +
			"Restartujte počítač a zkuste to znovu. Pokud to nepomůže, pošlete mi prosím\n" +
			"soubor " + logPath() + " (Průzkumník: zkopírujte tuto cestu do adresního řádku).")
		return
	}

	content, err := fs.Sub(appFiles, "app")
	if err != nil {
		logf("poškozený obsah: %v", err)
		alert("Poškozený soubor aplikace — stáhněte ho prosím znovu.")
		return
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/__ping", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprint(w, marker)
	})
	mux.Handle("/", noCache(http.FileServer(http.FS(content))))
	go (&http.Server{Handler: mux}).Serve(listener)

	if !waitUntilReady() {
		logf("server nenaběhl")
		alert("Vnitřní server aplikace se nepodařilo nastartovat.\n\n" +
			"Pošlete mi prosím soubor " + logPath() + ".")
		return
	}
	logf("server běží na %s", appURL)

	cmd, launchErr := openWindow()
	if cmd == nil {
		// Nenašel se Edge ani Chrome, nebo se je nepodařilo spustit. Aplikace
		// se otevře v běžném prohlížeči a běží, dokud ji uživatel neukončí.
		logf("okno se nepodařilo otevřít: %v", launchErr)
		fallback("Aplikaci se nepodařilo otevřít ve vlastním okně" +
			hint(launchErr) + ",\notevřel jsem ji proto ve vašem prohlížeči.")
		return
	}

	start := time.Now()
	cmd.Wait()
	logf("okno zavřeno po %s", time.Since(start).Round(time.Millisecond))

	// Okno zmizelo během chviličky — to není zavření uživatelem, ale selhání
	// prohlížeče (zamčený profil, blokace politikou). Bez téhle větve by program
	// beze slova skončil a vypadalo by to, že se po spuštění nestalo nic.
	if time.Since(start) < 3*time.Second {
		fallback("Okno aplikace se nepodařilo udržet otevřené,\notevřel jsem ji proto ve vašem prohlížeči.")
	}
}

// hint doplní do hlášky nejpravděpodobnější příčinu, aby uživatel nemusel
// hledat v protokolu.
func hint(err error) string {
	if err == nil {
		return " (nenašel jsem Edge ani Chrome)"
	}
	return " (" + err.Error() + ")"
}

// fallback otevře aplikaci v systémovém prohlížeči a drží program běžet,
// dokud uživatel nezavře informační okno.
func fallback(duvod string) {
	openInDefaultBrowser()
	alert(duvod + "\n\n" +
		"Aplikace běží na adrese " + appURL + "\n" +
		"Zavřením tohoto okna ji ukončíte.")
}

// logPath je textový protokol posledních spuštění. Kdyby program selhal
// dřív, než stihne cokoli zobrazit, zůstane po něm alespoň tahle stopa.
func logPath() string {
	return filepath.Join(profileDir(), "protokol.txt")
}

func logf(format string, args ...any) {
	f, err := os.OpenFile(logPath(), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	fmt.Fprintf(f, format+"\n", args...)
}

// noCache brání prohlížeči držet starou verzi stránky po aktualizaci programu.
func noCache(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func alreadyRunning() bool {
	// Proxy natvrdo vypnutá: na firemních počítačích bývá v proměnných
	// prostředí nastavená a dotaz na vlastní adresu by přes ni neprošel.
	client := &http.Client{
		Timeout:   400 * time.Millisecond,
		Transport: &http.Transport{Proxy: nil},
	}
	resp, err := client.Get(appURL + "__ping")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 64))
	return string(body) == marker
}

func waitUntilReady() bool {
	for i := 0; i < 50; i++ {
		if alreadyRunning() {
			return true
		}
		time.Sleep(40 * time.Millisecond)
	}
	return false
}

// openWindow spustí prohlížeč v režimu aplikace (okno bez adresního řádku
// a panelů). Vrací nil, pokud se okno otevřít nepodařilo.
func openWindow() (*exec.Cmd, error) {
	browser := findBrowser()
	if browser == "" {
		return nil, nil
	}
	args := append([]string{
		"--app=" + appURL,
		"--user-data-dir=" + profileDir(),
		"--window-size=1200,900",
		"--no-first-run",
		"--no-default-browser-check",
	}, extraArgs()...)
	cmd := exec.Command(browser, args...)
	if err := cmd.Start(); err != nil {
		return nil, err
	}
	return cmd, nil
}
