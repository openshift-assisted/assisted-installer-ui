#!/bin/bash

set -e

BUILD_OUTPUT=${BUILD_OUTPUT:-./dist}
FACET_ROOT=${FACET_ROOT:-../facet}

function sync {
  rsync -avz --delete ${BUILD_OUTPUT} ${FACET_ROOT}/node_modules/facet-lib
}

sync
cp ./package.json ${FACET_ROOT}/node_modules/facet-lib/package.json
while inotifywait -r -e modify,create,delete,move ./dist ; do
  sleep 2 # give JS bundler time to write everything
  sync
done

