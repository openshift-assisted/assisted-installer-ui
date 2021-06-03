#! /usr/bin/env bash

node_modules/.bin/concurrently \
  -n "start-lib,sync-dist,start-uhc" \
  -c "magenta,cyan,yellow" \
  "yarn start" "yarn sync-to-ui" "cd ../uhc-portal; yarn dev-server --env noproxy api-env=staging"
