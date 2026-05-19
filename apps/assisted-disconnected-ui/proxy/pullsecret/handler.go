package pullsecret

import (
	"net/http"
	"os"

	"github.com/openshift-assisted/assisted-disconnected-ui/log"
)

// Handler serves GET /pull-secret: JSON pull-secret string for the UI (same shape as cluster pullSecret field).
func Handler(manifestPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		raw, err := os.ReadFile(manifestPath)
		if err != nil {
			if os.IsNotExist(err) {
				log.GetLog().WithField("path", manifestPath).Debug("pull secret manifest not found")
				w.WriteHeader(http.StatusNotFound)
				return
			}
			log.GetLog().WithError(err).Error("failed to read pull secret manifest")
			http.Error(w, "failed to read manifest", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(raw)
	}
}
