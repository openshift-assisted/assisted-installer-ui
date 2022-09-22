#!/bin/bash

i18next \"src/**/*.{js,jsx,ts,tsx}\" [-oc] -c ./scripts/i18next-parser.config.js;

find ./locales -type f -exec sed -i '' 's/": "ai:/": "/' {} \;
