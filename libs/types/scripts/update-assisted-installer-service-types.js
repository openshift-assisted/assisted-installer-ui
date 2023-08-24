#!/usr/bin/env node

import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import * as sw2dts from 'sw2dts';
import * as YAML from 'js-yaml';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function printUsage() {
  const message = `
Description:
Generates a TypeScript definition file (d.ts) from https://github.com/openshift/assisted-service/blob/master/swagger.yaml. 

Usage:
yarn run update:api [(version|-h|--help)]

Remarks:
The version parameter corresponds to a valid version tag in the assisted-service repo (https://github.com/openshift/assisted-service).
If the version parameter is not provided, master will be used.
`;
  console.log(message.trim());
}

async function main(argv) {
  if (/(--help|-h)/.test(argv[0])) {
    printUsage();
    process.exit();
  }

  const version = argv[0] ?? 'master';
  const swaggerUrl = `https://raw.githubusercontent.com/openshift/assisted-service/${version}/swagger.yaml`;
  const outputFile = path.resolve(__dirname, '../assisted-installer-service.d.ts');
  const response = await fetch(swaggerUrl);
  const data = await response.text();
  const dts = await sw2dts.convert(YAML.load(data), { withQuery: true });
  const dtsCamelCased = dts.replace(/([a-z0-9]+)_([a-z])/g, (_substring, ...args) => {
    return args[0] + args[1].toUpperCase();
  });
  fs.writeFileSync(outputFile, dtsCamelCased);
}

void main(process.argv.slice(2));
