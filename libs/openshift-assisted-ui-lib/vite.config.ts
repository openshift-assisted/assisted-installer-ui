import module from "node:module";
import path from "node:path";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";

const require = module.createRequire(import.meta.url);
const pkgManifest = require('./package.json');

export default defineConfig({
  build: {
    lib: {
      entry: {
        'main': path.resolve(pkgManifest.exports["."]),
        'ocm': path.resolve(pkgManifest.exports["./ocm"]),
        'cim': path.resolve(pkgManifest.exports["./cim"]),
      },
      formats: ['es', 'cjs'],
    },
    minify: false,
    rollupOptions: {
      external: Object.keys(pkgManifest.peerDependencies),
    },
    outDir: "build/lib",
    sourcemap: true,
  },
  plugins: [react()],
});
