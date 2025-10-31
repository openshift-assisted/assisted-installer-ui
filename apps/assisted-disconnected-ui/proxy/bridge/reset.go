package bridge

import (
	"errors"
	"net/http"
	"os"
	"time"

	"github.com/openshift-assisted/assisted-disconnected-ui/config"
	"github.com/openshift-assisted/assisted-disconnected-ui/log"
)

func ResetClusterHandler(w http.ResponseWriter, r *http.Request) {
	exists, err := fileExists()
	if err != nil {
		log.GetLog().WithError(err).Warn("Failed to check if reset file exists")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := touchFile(exists); err != nil {
		log.GetLog().WithError(err).Warn("Failed to touch reset file")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func fileExists() (bool, error) {
	if _, err := os.Stat(config.ResetFilePath); err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return false, err
		}
		return false, nil
	}
	return true, nil
}

func touchFile(exists bool) error {
	if !exists {
		_, err := os.Create(config.ResetFilePath)
		return err
	}
	currentTime := time.Now()
	return os.Chtimes(config.ResetFilePath, time.Now(), currentTime)
}
