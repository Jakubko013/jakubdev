//go:build !windows

// Varianta pro testovací sestavení mimo Windows.
package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func findBrowser() string {
	for _, path := range []string{"/opt/pw-browsers/chromium", "/usr/bin/chromium", "/usr/bin/google-chrome"} {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			return path
		}
	}
	return ""
}

func profileDir() string {
	dir := filepath.Join(os.TempDir(), "iso-paneels-nabidky-profile")
	os.MkdirAll(dir, 0o755)
	return dir
}

// Testovací prostředí běží pod rootem, kde Chromium bez tohoto přepínače skončí.
func extraArgs() []string { return []string{"--no-sandbox"} }

func openInDefaultBrowser() {
	exec.Command("xdg-open", appURL).Start()
}

func alert(message string) {
	fmt.Fprintln(os.Stderr, message)
}
