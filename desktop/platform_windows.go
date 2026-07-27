package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
	"unsafe"
)

// findBrowser hledá Edge (na Windows 10/11 je vždy) a jako záloha Chrome.
func findBrowser() string {
	var candidates []string
	for _, root := range []string{
		os.Getenv("ProgramFiles(x86)"),
		os.Getenv("ProgramFiles"),
		os.Getenv("LOCALAPPDATA"),
	} {
		if root == "" {
			continue
		}
		candidates = append(candidates,
			filepath.Join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
			filepath.Join(root, "Google", "Chrome", "Application", "chrome.exe"),
		)
	}
	for _, path := range candidates {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			return path
		}
	}
	return ""
}

// profileDir drží data okna aplikace (mimo jiné uložený ceník a nastavení)
// odděleně od běžného prohlížeče uživatele.
func profileDir() string {
	base := os.Getenv("LOCALAPPDATA")
	if base == "" {
		base = os.TempDir()
	}
	// Bez mezery a diakritiky — cesta jde jako parametr do příkazové řádky
	// prohlížeče a některé firemní politiky si s mezerou neporadí.
	dir := filepath.Join(base, "ISO-Paneels-Nabidky")
	os.MkdirAll(dir, 0o755)
	return dir
}

func extraArgs() []string { return nil }

func openInDefaultBrowser() {
	cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", appURL)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	cmd.Start()
}

// alert zobrazí systémové okno se zprávou (program nemá vlastní konzoli).
func alert(message string) {
	user32 := syscall.NewLazyDLL("user32.dll")
	messageBox := user32.NewProc("MessageBoxW")
	title, _ := syscall.UTF16PtrFromString("ISO.Paneels — Cenové nabídky")
	text, _ := syscall.UTF16PtrFromString(message)
	messageBox.Call(0,
		uintptr(unsafe.Pointer(text)),
		uintptr(unsafe.Pointer(title)),
		0x40, // MB_ICONINFORMATION
	)
}
