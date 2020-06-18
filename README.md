# facet-lib

React component library for https://github.com/openshift-metal3/facet.

>

[![NPM](https://img.shields.io/npm/v/facet-lib.svg)](https://www.npmjs.com/package/facet-lib)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save facet-lib

or

yarn add facet-lib
```

## Develop
One time action:
```bash
sudo dnf install -y inotify-tools
yarn install
```

Start webpack dev server to watch sources and keep compiling into `/dist`:
```bash
yarn start
```

Optionaly, sync `/dist` to the [Facet](https://github.com/openshift-metal3/facet) application's `node_modules`.

```bash
yarn sync-to-facet

# eventually:
FACET_ROOT=../facet ./scripts/sync-dist.sh # to sync the "./dist" into facet's node_modules
```

## Publish
To build and publish:
```bash
yarn publish # and update version

# Do not forget to push a PR with version change, i.e.:
git add package.json
git commit
git push
```

## License

Apache-2.0
