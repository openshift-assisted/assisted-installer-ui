#! /usr/bin/env bash

node_modules/.bin/concurrently \
  -n "start-lib,sync-dist,start-uhc" \
  -c "magenta,cyan,yellow" \
  "yarn start" "yarn sync-dist" "yarn --cwd ../uhc-portal start"
