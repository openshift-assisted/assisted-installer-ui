#!/usr/bin/env bash
set -euo pipefail

SWAGGER_FILE='libs/openshift-assisted-ui-lib/src/common/api/swagger.yaml'
TYPES_FILE='libs/openshift-assisted-ui-lib/src/common/api/types.ts'
ASSISTED_SERVICE_SWAGGER_URL='https://raw.githubusercontent.com/openshift/assisted-service/master/swagger.yaml'

curl ${ASSISTED_SERVICE_SWAGGER_URL} > "${SWAGGER_FILE}"
yarn sw2dts -w -o "${TYPES_FILE}" "${SWAGGER_FILE}"
sed -i -r 's/([a-z1-9]+)_([a-z])/\1\U\2/g' "${TYPES_FILE}"
