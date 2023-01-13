#!/usr/bin/env bash
set -euo pipefail

if [ ! -d  build ]; then
  yarn build
else
  echo 'Previewing files using the existing '\''build'\'' directory'
fi