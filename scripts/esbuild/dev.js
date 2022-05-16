/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const commonConfig = require('./common-config');
const { publishPackage } = require('yalc');
const { join } = require('path');

function publishWithYalc() {
  try {
    publishPackage({
      workingDir: join(process.cwd() || ''),
      push: true,
      replace: true,
      changed: true,
    });
  } catch (e) {
    console.log('Failed to publish the package with Yalc:', e);
  }
}

esbuild
  .build({
    ...commonConfig,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('Watch build failed:', error);
        else {
          console.log('Watch build succeeded:', result);
          publishWithYalc();
        }
      },
    },
  })
  .then((result) => {
    console.log('Build succeeded and started watching', result);
    publishWithYalc();
  });
