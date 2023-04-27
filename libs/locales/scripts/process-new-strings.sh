#!/usr/bin/env bash
set -euo pipefail

yarn i18next --config i18next-parser.config.cjs
find lib -type f -exec sed -i 's#": "ai:#": "#' {} \;
