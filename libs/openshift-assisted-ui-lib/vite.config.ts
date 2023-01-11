import module from "node:module";
import path from "node:path";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";

const ASSISTED_UI_LIB_DIR = 'libs/openshift-assisted-ui-lib';

const require = module.createRequire(import.meta.url);
const pkgManifest = require(`${ASSISTED_UI_LIB_DIR}/package.json`);
delete pkgManifest['$schema'];

export default defineConfig({
  build: {
    lib: {
      entry: {
        'main': path.resolve(ASSISTED_UI_LIB_DIR, pkgManifest.exports["./"]),
        'ocm-lib': path.resolve(ASSISTED_UI_LIB_DIR, pkgManifest.exports["./ocm"]),
        'cim-lib': path.resolve(ASSISTED_UI_LIB_DIR, pkgManifest.exports["./cim"]),
      },
      formats: ['es', 'cjs'],
    },
    minify: false,
    rollupOptions: {
      external: Object.keys(pkgManifest.peerDependencies),
    },
    sourcemap: true,
  },
  plugins: [react()],
});
