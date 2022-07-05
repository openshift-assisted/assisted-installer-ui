const fs = require('fs');
const path = require('path');

function main(args) {
  const PKG_JSON_PATH = args[1];
  const pkg = require(path.resolve(PKG_JSON_PATH));
  pkg.version = args[2];
  fs.writeFileSync(PKG_JSON_PATH, JSON.stringify(pkg, null, 2));
}

if (require.main === module) main(process.argv.slice(1));
