#!/usr/bin/env bash
set -eo pipefail

export ASSISTED_SERVICE_URL="${ASSISTED_SERVICE_URL:-'http://localhost:8090'}"

# shellcheck disable=SC2016
envsubst '$ASSISTED_SERVICE_URL' < /deploy/nginx.conf > "$NGINX_DEFAULT_CONF_PATH/nginx.conf"

if [ "$ASSISTED_SERVICE_SCHEME" = "https" ]; then
    # shellcheck disable=SC2016
    envsubst '${HTTPS_CERT_FILE} ${HTTPS_KEY_FILE}' < /deploy/nginx_ssl.conf > "${NGINX_CONF_PATH}"
fi

# Do not listen on IPv6 if it's not enabled in the hardware
if grep 'ipv6.disable=1' /proc/cmdline; then
    cp "${NGINX_CONF_PATH}" ~/nginx.conf.orig
    sed -e 's/listen\s*\[::\].*//g' ~/nginx.conf.orig | dd of="${NGINX_CONF_PATH}"
fi

# Link access and error log files to stdout/stderr
# respectively in order to allow logs collection.
# See: https://docs.docker.com/config/containers/logging/
ln -sf /dev/stdout /var/log/nginx/access.log
ln -sf /dev/stderr /var/log/nginx/error.log

exec nginx -g "daemon off; error_log /dev/stderr warn;"
