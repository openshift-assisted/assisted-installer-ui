#!/usr/bin/env bash
set -euo pipefail

yarn i18next \"libs/openshift-assisted-ui-lib/src/**/*.{js,jsx,ts,tsx}\" \
    -c scripts/i18next-parser.config.js

find locales \
    -type f \
    -name "translation.json" \
    -exec sed -i 's/": "ai:/": "/' {} \;
