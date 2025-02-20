package config

import (
	"os"
	"strings"
)

var (
	BridgePort     = ":" + getEnvVar("BRIDGE_PORT", "3001")
	AssistedApiUrl = getEnvUrlVar("AIUI_APP_API_URL", "")
	ApiInsecure    = getEnvVar("API_INSECURE_SKIP_VERIFY", "false")
	TlsKeyPath     = getEnvVar("TLS_KEY", "")
	TlsCertPath    = getEnvVar("TLS_CERT", "")
)

func getEnvUrlVar(key string, defaultValue string) string {
	urlValue := getEnvVar(key, defaultValue)
	return strings.TrimSuffix(urlValue, "/")
}

func getEnvVar(key string, defaultValue string) string {
	val, ok := os.LookupEnv(key)
	if !ok {
		return defaultValue
	}
	return val
}
