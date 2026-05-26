package pullsecret

import (
	"encoding/json"
	"testing"
)

func TestExtractForUI(t *testing.T) {
	t.Parallel()

	manifest := `apiVersion: v1
kind: Secret
metadata:
  name: pull-secret
stringData:
  .dockerconfigjson: '{"auths":{"cloud.openshift.com":{"auth":"user:pass"}}}'
`

	t.Run("extracts auths from Secret manifest", func(t *testing.T) {
		t.Parallel()
		got := extractForUI([]byte(manifest))
		var parsed map[string]any
		if err := json.Unmarshal(got, &parsed); err != nil {
			t.Fatalf("invalid json: %v", err)
		}
		gotAuths, ok := parsed["auths"].(map[string]any)
		if !ok {
			t.Fatalf("expected auths object, got %#v", parsed)
		}
		if gotAuths["cloud.openshift.com"] == nil {
			t.Fatalf("missing auth entry: %#v", gotAuths)
		}
	})

	t.Run("passes through plain pull secret JSON", func(t *testing.T) {
		t.Parallel()
		plain := `{"auths":{"cloud.openshift.com":{"auth":"user:pass"}}}`
		got := string(extractForUI([]byte(plain)))
		if got != plain {
			t.Fatalf("got %q, want %q", got, plain)
		}
	})

	t.Run("empty input", func(t *testing.T) {
		t.Parallel()
		if got := extractForUI([]byte("  \n")); got != nil {
			t.Fatalf("got %q, want nil", got)
		}
	})

	t.Run("invalid yaml returns trimmed raw", func(t *testing.T) {
		t.Parallel()
		raw := "not-yaml-content"
		got := string(extractForUI([]byte(raw)))
		if got != raw {
			t.Fatalf("got %q, want %q", got, raw)
		}
	})

}
