package bridge

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gorilla/mux"

	"github.com/openshift-assisted/assisted-disconnected-ui/config"
	"github.com/openshift-assisted/assisted-disconnected-ui/log"
)

const AssistedPingEndpoint = "/api/assisted-install/v2/clusters"

type handler struct {
	target *url.URL
	proxy  *httputil.ReverseProxy
}

func (h handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.URL.Host = h.target.Host
	r.URL.Scheme = h.target.Scheme
	r.Header.Set("X-Forwarded-Host", r.Header.Get("Host"))
	r.Host = h.target.Host
	r.URL.Path = mux.Vars(r)["forward"]
	h.proxy.ServeHTTP(w, r)
}

func createReverseProxy(apiURL string) (*url.URL, *httputil.ReverseProxy) {
	target, err := url.Parse(apiURL)
	if err != nil {
		panic(err)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ModifyResponse = func(r *http.Response) error {
		filterHeaders := []string{
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Methods",
			"Access-Control-Allow-Origin",
			"Access-Control-Expose-Headers",
		}
		for _, h := range filterHeaders {
			r.Header.Del(h)
		}
		return nil
	}
	return target, proxy
}

func NewAssistedAPIHandler(tlsConfig *tls.Config) (*handler, error) {
	client := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}
	resp, err := client.Get(fmt.Sprintf("%s%s", config.AssistedApiUrl, AssistedPingEndpoint))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Assisted Installer: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected response code from Assisted Installer: %v", resp.StatusCode)
	}
	log.GetLog().Info("Successfuly connected to Assisted Installer")
	target, proxy := createReverseProxy(fmt.Sprintf("%s/api", config.AssistedApiUrl))

	proxy.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return &handler{target: target, proxy: proxy}, nil
}
