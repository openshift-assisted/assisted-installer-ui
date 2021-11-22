/* eslint-disable @typescript-eslint/no-var-requires */
const { dtsPlugin } = require('esbuild-plugin-d.ts');
const pkg = require('../../package.json');

module.exports = {
  entryPoints: ['src/index.ts', 'src/cim/index.ts', 'src/ocm/index.ts'],
  // don't bundle dependences and peerDependencies https://github.com/evanw/esbuild/issues/727#issuecomment-771743582
  external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies || {})],
  bundle: true,
  sourcemap: true,
  outdir: 'dist',
  format: 'esm',
  target: ['esnext'],
  plugins: [dtsPlugin()], // requires "noEmit": false in tsconfig.json to successfully emit types
};
