#!/usr/bin/env bash
set -euo pipefail

source scripts/env.sh

operation="$1"
if [ "$operation" != 'build' ] && [ "$operation" != 'preview' ] && [ "$operation" != 'serve' ]; then
  echo "Invalid operation: $operation"
  exit 1
fi

# A path to one of the projects in the workspaces of this monorepo
project="$2"
if ! [ -d "$project" ];then
  echo "Invalid project: $project"
  exit 2
fi

if [ "$operation" == 'preview' ] || [ "$operation" == 'serve' ]; then
  export $(cat .env.development.local)
fi

yarn vite "$operation" -c vite.config.ts "$project"


