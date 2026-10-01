/* =====================================================================
   GO TAB - SAMPLE
   One sample so the Go tab renders and the checks have something to read.
   A later worker replaces and extends it. The snippet is a whole Go file.
   ===================================================================== */

// SAMPLE: replace with the real Go entry.
GO('backend-go-idioms', {
  api:['http.Server', 'ReadHeaderTimeout', 'WriteTimeout', 'IdleTimeout', 'Server.ListenAndServe'],
  snippet:`package main

import (
	"log"
	"net/http"
	"time"
)

func main() {
	srv := &http.Server{
		Addr:              ":8080",
		Handler:           http.NewServeMux(),
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Fatal(srv.ListenAndServe())
}
`,
  pitfall:'A bare http.ListenAndServe has no timeouts, so one slow client can hold a connection open forever. Set the timeouts on an http.Server you own.'
});
