import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';

/** @typedef {typeof import('../package.json')} PackageJSON */

/** @type {(filePath: string) => PackageJSON} */
const readPackageJSON = (filePath) => {
  const fileContent = fs.readFileSync(filePath).toString();
  return JSON.parse(fileContent);
};

function main() {
  const workspaceDir = url.fileURLToPath(new URL('..', import.meta.url));
  const destFile = path.resolve(workspaceDir, 'build/build.json');
  const packageJSON = readPackageJSON(path.resolve(workspaceDir, 'package.json'));
  const version = packageJSON.version;
  const versionData = {
    version,
  };
  console.log(`Writing build manifest for version ${version} to ${destFile}`);
  fs.writeFileSync(destFile, JSON.stringify(versionData, null, 2));
}

main();
