<h1 align="center">
  The Assisted Installer User Interface
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/openshift-assisted-ui-lib"><img alt='NPM' src='https://img.shields.io/npm/v/openshift-assisted-ui-lib.svg'></a>
</p>

## Install

```bash
npm install --save @openshift-assisted/ui-lib
```

or

```
yarn add @openshift-assisted/ui-lib
```

## Development

### About the repository's folder structure

This is a [monorepo](https://monorepo.tools/), as such, it's composed of many different projects.  
The principal folders are: `apps` and `libs`.

### Prerequisites

1. A Linux distro, like Fedora.
2. [NodeJS](https://nodejs.org/en) > v14, or any newer LTS version.
3. This project uses `rsync` in order to synchronize .css files in one if it's build steps.
4. A back-end API to connect to. Please see instructions in
   [assisted-test-infra](https://github.com/openshift/assisted-test-infra).

### Setting up a dev-environment

1. Create a parent directory, e.g. `~/Projects`.
2. Create your own fork of this repo and `git clone` it. Then run the following commands from the
   repository';'s root directory
   - ```bash
     cd ~/Projects
     git clone https://github.com/<username>/assisted-installer-ui.git
     ```
3. Create a `.env.local` file in `apps/assisted-ui/` and add the Assisted Installer API URL
   - ```ini
     AIUI_APP_API_URL=http://<host-ip>:6008
     ```
4. Set up the package managers shims and install the project dependencies:
   - ```bash
     npm i -g corepack
     corepack enable
     yarn install
     ```
5. Build the project
   - ```bash
        yarn build:all
     ```
6. Start the Assisted Installer UI stand-alone app
   - ```bash
     yarn workspace @openshift-assisted/assisted-ui serve
     ```
7. Browse to http://localhost:5173/ using a [modern web browser](https://caniuse.com/usage-table).

#### UHC portal workflow

Assisted Installer UI is integrated in
[uhc-portal](https://gitlab.cee.redhat.com/service/uhc-portal.git) (the full OCM app, GitLab access
needed).

Use this environnement if you want to test the integration of ui-lib in uhc-portal. For development
purposes prefer the use of assisted-ui application.

1. [Install yalc on your system](https://github.com/wclr/yalc#installation). yalc simulate the yarn
   publish workflow without publishing our packages to the remote registry.

   - ```bash
     yalc --version
     ```

2. In one terminal run ui-lib in watch mode. It will build and publish `@openshift-assisted/ui-lib`
   packages everytime you make a change.

   - ```bash
     cd libs/ui-lib
     yarn watch
     ```

3. In another terminal, fork and clone
   [uhc-portal](https://gitlab.cee.redhat.com/service/uhc-portal.git):

   - ```bash
      cd ~/Projects
      git clone https://gitlab.cee.redhat.com/<username>/uhc-portal.git
     ```

4. The first time, install npm dependencies and link `@openshift-assisted/ui-lib` and
   `@openshift-assisted/locales` using yalc. You can skip this after. The watcher on ui-lib will
   update the packages for you.  
   Be aware that `yalc` updates the `yarn.lock` file. DO NOT INCLUDE THESE CHANGES INTO VERSION
   CONTROL.

   - ```bash
      cd uhc-portal
      yarn install
      yalc link @openshift-assisted/ui-lib
      yalc link @openshift-assisted/locales
     ```

5. Now you can start uhc-portal. Please follow the
   [uhc-portal README](https://gitlab.cee.redhat.com/service/uhc-portal/-/blob/master/README.md)

   - ```bash
      yarn start
     ```

6. Visit https://ENV.foo.redhat.com:1337/openshift/assisted-installer/clusters/~new

#### CIM workflow

    // TODO...

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

The types used by Assisted Installer UI are defined in `libs/ui-lib/common/api/types.ts` and they
are generated automatically by running `yarn workspace @openshift-assisted/ui-lib update-api`.

## i18n

See [i18n](docs/I18N.md) for information on our internationalization tools and guidelines.

## License

Apache-2.0
