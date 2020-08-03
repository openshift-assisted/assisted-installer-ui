#!/bin/bash

set -e

BUILD_OUTPUT=${BUILD_OUTPUT:-./dist}
FACET_ROOT=${FACET_ROOT:-../facet}
UHC_PORTAL=${UHC_PORTAL:-../uhc-portal}

function sync {
  if [ -d "${FACET_ROOT}" ]; then
    rsync -avz --delete ${BUILD_OUTPUT} ${FACET_ROOT}/node_modules/facet-lib
  else
    echo Sync to ${FACET_ROOT}/node_modules/facet-lib skipped
  fi

  if [ -d "${UHC_PORTAL}" ]; then
    rsync -avz --delete ${BUILD_OUTPUT} ${UHC_PORTAL}/node_modules/facet-lib
  else
    echo Sync to ${UHC_PORTAL}/node_modules/facet-lib skipped
  fi
}

sync
cp ./package.json ${FACET_ROOT}/node_modules/facet-lib/package.json || true
cp ./package.json ${UHC_PORTAL}/node_modules/facet-lib/package.json || true

while inotifywait -r -e modify,create,delete,move ./dist ; do
  sleep 2 # give JS bundler time to write everything
  sync
done

