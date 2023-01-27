import module from "node:module";
import path from "node:path";
import {defineConfig} from "vite";
import dts from 'vite-plugin-dts'

const require = module.createRequire(import.meta.url);
const pkgManifest = require('./package.json');

export default defineConfig({
  build: {
    lib: {
      entry: { 'index': path.resolve(pkgManifest.exports["."]) },
      formats: ['es', 'cjs'],
    },
    minify: false,
    rollupOptions: {
      external: [...Object.keys(pkgManifest.peerDependencies), /node_modules/],
      output: {
        exports: "named",
        preserveModules: true,
        sourcemapExcludeSources: true,
      }
    },
    outDir: "build/src",
    sourcemap: true,
  },
  plugins: [
    dts({
      outputDir: "build",
    })
  ],
});
