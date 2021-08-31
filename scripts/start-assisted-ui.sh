#! /usr/bin/env bash

node_modules/.bin/concurrently \
  -n "start-lib,sync-to-ui,start-ui" \
  -c "magenta,cyan,yellow" \
  "yarn start" "yarn sync-to-ui" "cd ../assisted-ui; yarn start"
