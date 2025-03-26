package main

import (
	"crypto/tls"
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/openshift-assisted/assisted-disconnected-ui/bridge"
	"github.com/openshift-assisted/assisted-disconnected-ui/config"
	"github.com/openshift-assisted/assisted-disconnected-ui/log"
	"github.com/openshift-assisted/assisted-disconnected-ui/server"
)

func main() {
	log := log.InitLogs()

	tlsConfig, err := bridge.GetTlsConfig()
	if err != nil {
		log.Fatal(err)
	}

	apiHandler, err := bridge.NewAssistedAPIHandler(tlsConfig)
	if err != nil {
		log.Fatal(err)
	}

	router := mux.NewRouter()
	router.PathPrefix("/api/reset").HandlerFunc(bridge.ResetClusterHandler)
	router.PathPrefix("/api/assisted-install/{forward:.*}").Handler(apiHandler)

	spa := server.SpaHandler{}
	router.PathPrefix("/").Handler(server.GzipHandler(spa))

	var serverTlsconfig *tls.Config

	if config.TlsKeyPath != "" && config.TlsCertPath != "" {
		cert, err := tls.LoadX509KeyPair(config.TlsCertPath, config.TlsKeyPath)
		if err != nil {
			log.Fatal("failed to load TLS certs: %w", err)
		}
		serverTlsconfig = &tls.Config{
			Certificates: []tls.Certificate{cert},
		}
	}

	srv := &http.Server{
		Handler:      router,
		Addr:         config.BridgePort,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Info("Proxy running at", config.BridgePort)

	if serverTlsconfig != nil {
		srv.TLSConfig = serverTlsconfig
		log.Info("Running as HTTPS")
		log.Fatal(srv.ListenAndServeTLS("", ""))
	} else {
		log.Fatal(srv.ListenAndServe())
	}

}
