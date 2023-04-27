import fs from 'node:fs';

function main(args) {
  const pathToPackageJson = args[1];
  const newVersion = args[2];
  const packageJson = JSON.parse(fs.readFileSync(pathToPackageJson).toString());
  packageJson.version = newVersion;

  fs.writeFileSync(pathToPackageJson, JSON.stringify(packageJson, null, 2));
}

void main(process.argv.slice(1));
