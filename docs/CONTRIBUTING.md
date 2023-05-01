# How to Contribute

This project is [Apache 2.0 licensed](../LICENSE) and accepts contributions via GitHub pull
requests.

## Certificate of Origin

By contributing to this project you agree to the Developer Certificate of Origin (DCO). This
document was created by the Linux Kernel community and is a simple statement that you, as a
contributor, have the legal right to make the contribution. See the [DCO](DCO) file for details.

## About the repository's folder structure

This is a [monorepo](https://monorepo.tools/), as such, it's composed of many different projects.  
The principal folders are: `apps` and `libs`.

## Prerequisites

1. A Linux distro, like Fedora.
2. [NodeJS](https://nodejs.org/en) > v14, or any newer LTS version.
3. [Yarn](https://yarnpkg.com/getting-started/install)
4. This project uses `rsync` in order to synchronize .css files in one if it's build steps.
5. A back-end API to connect to. Please see instructions in
   [assisted-test-infra](https://github.com/openshift/assisted-test-infra).

## Setting up a local dev-environment (stand-alone)

1. Create your own fork of this repo and `git clone` it.
   ```bash
   git clone https://github.com/<username>/assisted-installer-ui.git
   ```
2. Create a `.env.local` file in `apps/assisted-ui/` and add the Assisted Installer API URL
   ```ini
   AIUI_APP_API_URL=http://<host-ip>:6008
   ```
3. Set up the package managers shims and install the project dependencies:
   ```bash
   yarn install
   ```
4. Build the project
   ```bash
   yarn build:all
   ```
5. Start the Assisted Installer UI stand-alone app
   ```bash
   yarn workspace @openshift-assisted/assisted-ui serve
   ```
6. Browse to http://localhost:5173/ using a [modern web browser](https://caniuse.com/usage-table).

## Integrating with UHC portal (OCM)

The Assisted Installer UI is consumed at build-time by other applications.  
The [uhc-portal](https://gitlab.cee.redhat.com/service/uhc-portal.git) is one of them and is the
application you see at https://console.redhat.com/openshift.

Use this setup if you want to test the integration of ui-lib inside the uhc-portal.

1. Install [yalc](https://github.com/wclr/yalc#installation). `yalc` simulates publishing packages
   but to a local registry.
   ```bash
   yalc --version
   ```
2. Fork and clone the project
   ```bash
   git clone https://gitlab.cee.redhat.com/<username>/uhc-portal.git
   ```
3. In one terminal run `libs/ui-lib` in watch mode. It will build and publish
   `@openshift-assisted/ui-lib` packages everytime you make a change.
   ```bash
   yarn workspace @openshift-assisted/ui-lib watch
   ```
4. The first time it runs, it installs npm dependencies and links `@openshift-assisted/ui-lib` and
   `@openshift-assisted/locales` using yalc. You can skip this after. The watcher on ui-lib will
   update the packages for you.  
   Be aware that `yalc` updates the `yarn.lock` file. DO NOT INCLUDE THESE CHANGES INTO VERSION
   CONTROL.
   ```bash
   cd uhc-portal
   yarn install
   yalc link @openshift-assisted/ui-lib
   yalc link @openshift-assisted/locales
   ```
5. Now you can follow the uhc-portal
   [README file](https://gitlab.cee.redhat.com/service/uhc-portal/-/blob/master/README.md) in order
   to set up their dev-environment.

## Integrating with CIM

```
// TODO...
```

## Updating the API types

The TypeScript types used by Assisted Installer UI are generated automatically from the
assisted-service's swagger file.  
These can be generated automatically by running:

```
yarn workspace @openshift-assisted/ui-lib update-api
```
