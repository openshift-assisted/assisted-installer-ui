export VITE_APP_API_ROOT="/api/assisted-install"
export VITE_APP_GIT_SHA="$(git rev-parse --short HEAD)"
export VITE_APP_IMAGE_REPO="quay.io/edge-infrastructure/assisted-installer-ui"
export VITE_APP_VERSION="$(jq -r '.version' ../../libs/openshift-assisted-ui-lib/package.json)"
