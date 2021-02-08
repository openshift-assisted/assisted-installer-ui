# Assisted Installer User Interface Library

React component library for
[https://github.com/openshift-assisted/assisted-ui](https://github.com/openshift-assisted/assisted-ui).

Please note, the project's upstream has been renamed and moved from **mareklibra/facet-lib** to
[https://github.com/openshift-assisted/assisted-ui-lib](https://github.com/openshift-assisted/assisted-ui-lib)
in December 2020.

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

Optionaly, sync `/dist` to the [assisted-ui](https://github.com/openshift-assisted/assisted-ui)
application's `node_modules`.

```bash
yarn sync-to-ui

# eventually:
ASSISTED_UI_ROOT=../assisted-ui UHC_PORTAL=../uhc-portal ./scripts/sync-dist.sh # listen to changes and sync the "./dist" with assisted-ui and uhc-portal node_modules
```

## Publish

To publish the Node.js package, simply create a new tag in format `v[VERSION]`.

To do so, preferably
[draft a new release](https://github.com/openshift-assisted/assisted-ui-lib/releases/new) with:

- tag: `v[VERSION]`, example: `v1.2.3`
- title: `v[VERSION]`, example: `v1.2.3`

New version of the package will be published to
[npmjs.com](https://www.npmjs.com/package/openshift-assisted-ui-lib) and a new PR with version
change will be created automatically by a GitHub action.

## Troubleshooting

### Increasing the amount of inotify watchers

If you see the following error: `Error: ENOSPC: System limit for number of file watchers reached`,
you will need to increase the number of inotify watchers.  
From the terminal run the following commands:

```bash
$ sudo sh -c "echo fs.inotify.max_user_watches=524288 >> /etc/sysctl.conf"
$ sudo sysctl -p
```

## License

Apache-2.0
