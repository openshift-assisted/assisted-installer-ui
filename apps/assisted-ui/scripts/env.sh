export VITE_APP_API_ROOT="/api/assisted-install"
# shellcheck disable=SC2155
export VITE_APP_GIT_SHA="$(git rev-parse --short HEAD)"
export VITE_APP_IMAGE_REPO="quay.io/edge-infrastructure/assisted-installer-ui"
# shellcheck disable=SC2155
export VITE_APP_VERSION="$(node -e 'require('\''../../libs/openshift-assisted-ui-lib/package.json'\'').version')"
