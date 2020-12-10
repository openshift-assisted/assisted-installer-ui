# Assisted Installer User Interface Library

React component library for https://github.com/openshift-metal3/facet.

Please note, the project's upstream has been renamed and moved from **mareklibra/facet-lib** to [https://github.com/openshift-assisted/assisted-ui-lib](https://github.com/openshift-assisted/assisted-ui-lib) in December 2020.

>

[![NPM](https://img.shields.io/npm/v/openshift-assisted-ui-lib.svg)](https://www.npmjs.com/package/openshift-assisted-ui-lib)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save openshift-assisted-ui-lib

or

yarn add openshift-assisted-ui-lib
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

Optionaly, sync `/dist` to the [Facet](https://github.com/openshift-metal3/facet) application's
`node_modules`.

```bash
yarn sync-to-facet

# eventually:
FACET_ROOT=../facet ./scripts/sync-dist.sh # to sync the "./dist" into facet's node_modules
```

## Publish

To publish the Node.js package, simply create a new tag in format `v[VERSION]`.

To do so, preferably [draft a new release](https://github.com/openshift-assisted/assisted-ui-lib/releases/new)
with:

- tag: `v[VERSION]`, example: `v1.2.3`
- title: `v[VERSION]`, example: `v1.2.3`

New version of the package will be published to [npmjs.com](https://www.npmjs.com/package/openshift-assisted-ui-lib)
and a new PR with version change will be created automatically by a GitHub action.

## License

Apache-2.0
