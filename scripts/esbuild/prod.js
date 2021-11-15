/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const commonConfig = require('./common-config');

esbuild
  .build({
    ...commonConfig,
    minify: true,
  })
  .catch(() => process.exit(1));
