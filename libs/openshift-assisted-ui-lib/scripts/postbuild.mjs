import module from "node:module";
import fs from "node:fs";

/**
 * This lifecycle script transforms the entry points in package.json
 * in order to reference the built modules instead of the ones in
 * the source code. After the transformation is applied it
 * writes the new package.json into the 'build' folder.
 */
function main() {
    const require = module.createRequire(import.meta.url);
    const pkgManifest = require('../package.json');
    pkgManifest.files = ["src"];
    pkgManifest.exports["."] = {
        import: './src/index.js',
        require: './src/index.cjs'
    };
    pkgManifest.exports["./cim"] = {
        import: './src/cim/index.js',
        require: './src/cim/index.cjs'
    };
    pkgManifest.exports["./ocm"] = {
        import: './src/ocm/index.js',
        require: './src/ocm/index.cjs'
    };
    pkgManifest.exports["./css"] = './src/style.css';
    pkgManifest.main = './src/index.cjs';
    pkgManifest.module = './src/index.js';
    pkgManifest.types = './src/index.d.ts';

    /**
     * The NEXT_VERSION variable can be used in CI/CD envs in order to populate
     * the version field in the new package.json
     */
    pkgManifest.version = process.env.NEXT_VERSION ?? '0.0.0';
    fs.writeFileSync(
        'build/package.json',
        JSON.stringify(pkgManifest, null, 2)
    );
}

main(process.argv.slice(1));
