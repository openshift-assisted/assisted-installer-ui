# Assisted Installer User Interface Library

React component library for
[https://github.com/openshift-assisted/assisted-ui](https://github.com/openshift-assisted/assisted-ui).

Please note, the project's upstream has been renamed and moved from **mareklibra/facet-lib** to
[https://github.com/openshift-assisted/assisted-ui-lib](https://github.com/openshift-assisted/assisted-ui-lib)
in December 2020.

[![NPM](https://img.shields.io/npm/v/openshift-assisted-ui-lib.svg)](https://www.npmjs.com/package/openshift-assisted-ui-lib)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save openshift-assisted-ui-lib

or

yarn add openshift-assisted-ui-lib
```

## Development

### Prerequisites

This project depends on the following package

- ```bash
  sudo dnf install -y inotify-tools
  ```

### Instructions

You can use the following steps in order to set up your dev environment.

1. Create a parent directory, e.g. `~/Projects`.
2. Create your own fork of this repo and `git clone` it.
   - ```bash
     cd ~/Projects
     git clone https://github.com/openshift-assisted/assisted-ui-lib.git
     ```
3. Install the project dependencies:
   - ```bash
     yarn --cwd=./assisted-ui-lib/ install
     ```
4. Fork and clone these projects too, they act as the main app:
   - [assisted-ui](https://github.com/openshift-assisted/assisted-ui) (a light-weight stand-alone
     app consuming this project),
   - [uhc-portal](https://gitlab.cee.redhat.com/service/uhc-portal.git) (the full OCM app, GitLab
     access needed).
5. These scripts start the project in watch mode:
   - ```bash
     # Watches for changes in the `/src` folder and bundles the files into `/dist` folder
     yarn start
     # Synchronizes `/dist` with `node_modules/openshift-assisted-ui-lib/` folder in .
     yarn sync-dist
     ```
6. This project uses the `assisted-ui` project to ease the development experience outside OCM (aka
   `uhc-portal`), follow the instructions in those projects in order to access the app's UI.

## Publish

To publish a new version of the package to
[npmjs.com](https://www.npmjs.com/package/openshift-assisted-ui-lib)

1. Create a new branch from `master` in this repo, called `release/v<some-semver-string>`.
2. [Draft a new release through GitHub's interface](https://github.com/openshift-assisted/assisted-ui-lib/releases/new).
3. Fill the form with the following details:
   1. Tag: `v<some-semver-string>`
   2. Target branch: `release/v<some-semver-string>` (same as in step 2 above).
   3. Title: `v<some-semver-string>`
   4. Description: Generate the release notes automatically (or edit the field manually)

## Updating the API types

The types used by Assisted Installer UI are defined in `src/common/api/types.ts` and they are
generated automatically by running `yarn update-api`.

## Troubleshooting

### Increasing the amount of inotify watchers

If you see the following error: `Error: ENOSPC: System limit for number of file watchers reached`,
you will need to increase the number of inotify watchers.  
From the terminal run the following commands:

```bash
$ sudo sh -c "echo fs.inotify.max_user_watches=524288 >> /etc/sysctl.conf"
$ sudo sysctl -p
```

## i18n

See [i18n](I18N.md) for information on our internationalization tools and guidelines

## License

Apache-2.0
