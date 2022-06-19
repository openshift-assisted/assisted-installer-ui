/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const commonConfig = require('./common-config');

esbuild
  .build({
    ...commonConfig,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('Watch build failed:', error);
        else console.log('Watch build succeeded:', result);
      },
    },
  })
  .then((result) => console.log('Build succeeded and started watching', result));
