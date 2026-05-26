package pullsecret

import (
	"encoding/base64"
	"encoding/json"
	"strings"

	"gopkg.in/yaml.v3"
)

type secretManifest struct {
	StringData map[string]string `yaml:"stringData"`
	Data       map[string]string `yaml:"data"`
}

type dockerConfigJSON struct {
	Auths map[string]any `json:"auths"`
}

// extractForUI returns pull-secret JSON `{ "auths": … }` for the cluster API from a mounted
// Secret manifest. If raw is already that shape (or not a Secret manifest), it is returned as-is.
func extractForUI(raw []byte) []byte {
	trimmed := strings.TrimSpace(string(raw))
	if trimmed == "" {
		return nil
	}

	var doc secretManifest
	if err := yaml.Unmarshal([]byte(trimmed), &doc); err != nil {
		return []byte(trimmed)
	}

	dockerJSON := dockerConfigFromManifest(doc)
	if dockerJSON == "" {
		return []byte(trimmed)
	}

	var cfg dockerConfigJSON
	if err := json.Unmarshal([]byte(strings.TrimSpace(dockerJSON)), &cfg); err != nil {
		return []byte(trimmed)
	}
	if cfg.Auths == nil {
		return []byte(trimmed)
	}

	out, err := json.MarshalIndent(map[string]any{"auths": cfg.Auths}, "", "  ")
	if err != nil {
		return []byte(trimmed)
	}
	return out
}

func dockerConfigFromManifest(doc secretManifest) string {
	if doc.StringData != nil {
		if v := doc.StringData[".dockerconfigjson"]; strings.TrimSpace(v) != "" {
			return v
		}
	}
	if doc.Data != nil {
		if b64, ok := doc.Data[".dockerconfigjson"]; ok {
			if decoded, err := base64.StdEncoding.DecodeString(b64); err == nil {
				return string(decoded)
			}
		}
	}
	return ""
}
