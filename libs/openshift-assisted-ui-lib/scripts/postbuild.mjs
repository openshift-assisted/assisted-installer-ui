import module from "node:module";
import fs from "node:fs";

/**
 * This lifecycle script transforms the entry points in package.json
 * in order to reference the built modules instead of the ones in
 * the source code. After the transformations had been applied it
 * writes the new package.json in the 'build' folder.
 */
function main() {
    const require = module.createRequire(import.meta.url);
    const pkgManifest = require('../package.json');
    pkgManifest.files = ["lib"];
    pkgManifest.exports["."] = {
        import: './lib/main.js',
        require: './lib/main.cjs'
    };
    pkgManifest.exports["./cim"] = {
        import: './lib/cim.js',
        require: './lib/cim.cjs'
    };
    pkgManifest.exports["./ocm"] = {
        import: './lib/ocm.js',
        require: './lib/ocm.cjs'
    };
    pkgManifest.exports["./css"] = './lib/style.css';
    pkgManifest.main = './lib/main.cjs'
    pkgManifest.module = './lib/main.js'
    /**
     * The NEXT_VERSION variable can be assigned to the value
     * of a git tag in CI/CD envs in order to populate the
     * version field in the new package.json
     */
    pkgManifest.version = process.env.NEXT_VERSION ?? '0.0.0';
    fs.writeFileSync(
        'build/package.json',
        JSON.stringify(pkgManifest, null, 2)
    );
}

main(process.argv.slice(1));
