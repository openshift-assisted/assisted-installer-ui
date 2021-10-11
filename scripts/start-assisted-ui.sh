#! /usr/bin/env bash

node_modules/.bin/concurrently --kill-others-on-fail \
  -n "start-lib,sync-dist,start-ui" \
  -c "magenta,cyan,yellow" \
  "yarn start" "yarn sync-dist" "yarn --cwd ../assisted-ui start"
