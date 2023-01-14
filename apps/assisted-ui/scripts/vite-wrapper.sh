#!/usr/bin/env bash
set -euo pipefail

command=$1

source scripts/env.sh

if [[ "$command" =~ ^(preview|serve)$ ]];then
  export "$(grep -E '^VITE_APP_API_URL' .env.development.local)"
fi

yarn vite "$command" -c vite.config.ts