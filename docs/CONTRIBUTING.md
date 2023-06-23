# How to Contribute

## Developer Certificate of Origin

By contributing to this project you agree to the Developer Certificate of Origin (DCO). This
document was created by the Linux Kernel community and is a simple statement that you, as a
contributor, have the legal right to make the contribution. See the [DCO](../DCO) file for details.

## About the repository's folder structure

This is a [monorepo](https://monorepo.tools/), as such, it's composed of many different projects.  
The principal folders are: `apps` and `libs`.

## Prerequisites

1. A Linux distro, like Fedora.
2. [NodeJS](https://nodejs.org/en) > v14, or newer LTS version.
3. [Yarn](https://yarnpkg.com/getting-started/install)
4. This project uses `rsync` in order to synchronize .css files in one of its build steps.
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

## Integrating with uhc-portal (OCM)

The Assisted Installer UI is consumed as a library at build-time by other applications.  
The [uhc-portal](https://gitlab.cee.redhat.com/service/uhc-portal.git) is one of them and is the
application you see at https://console.redhat.com/openshift.

Use this setup if you want to test the `libs/ui-lib` integration with the uhc-portal. These steps
apply for `libs/locales` as well.

1. Install [yalc](https://github.com/wclr/yalc#installation) (it simulates local package registry).
   ```bash
   # with yarn:
   yarn global add yalc
   ```
   ```bash
   # or with npm:
   npm i -g yalc
   ```
   ```bash
   # then verify the command works as expected
   yalc --version
   ```
2. In one terminal run `libs/ui-lib` in watch mode.  
   The script builds and publishes the `@openshift-assisted/ui-lib` package to the local registry
   everytime you make a change.
   ```bash
   yarn workspace @openshift-assisted/ui-lib watch
   ```
3. Fork and clone the uhc-portal project
   ```bash
   git clone https://gitlab.cee.redhat.com/<username>/uhc-portal.git
   ```
4. Inside the uhc-portal run the following commands
   ```bash
   yarn install
   yalc link @openshift-assisted/ui-lib
   yalc link @openshift-assisted/locales
   ```
   `yalc link` needs to be executed only after cloning or pulling new changes from the uhc-portal.
   **Be aware that this command updates the project's `yarn.lock` file**.  
   **DO NOT COMMIT THESE CHANGES INTO VERSION CONTROL.**
5. Now you can follow the uhc-portal's
   [README file](https://gitlab.cee.redhat.com/service/uhc-portal/-/blob/master/README.md) in order
   to set up their dev-environment.

## Integrating with CIM

Central infrastructure management part of Assisted Installer UI is integrated into
[stolostron/console](https://github.com/stolostron/console).

Use this setup if you want to test the `libs/ui-lib` integration with the stolostron/console. These
steps apply for `libs/locales` as well.

1. Install [yalc](https://github.com/wclr/yalc#installation) (it simulates local package registry).
   ```bash
   # with yarn:
   yarn global add yalc
   ```
   ```bash
   # or with npm:
   npm i -g yalc
   ```
   ```bash
   # then verify the command works as expected
   yalc --version
   ```
2. In one terminal run `libs/ui-lib` in watch mode.  
   The script builds and publishes the `@openshift-assisted/ui-lib` package to the local registry
   everytime you make a change.

   ```bash
   yarn workspace @openshift-assisted/ui-lib watch
   ```

3. In another terminal run `libs/locales` in watch mode.  
   The script builds and publishes the `@openshift-assisted/locales` package to the local registry
   everytime you make a change.

   ```bash
   yarn workspace @openshift-assisted/locales watch
   ```

4. Follow the stolostron/console
   [development setup guide](https://github.com/stolostron/console#running).
5. To use locally published @openshift-assisted packages inside the stolostron/console run the
   following commands
   ```bash
   cd frontend
   yalc link @openshift-assisted/ui-lib
   yalc link @openshift-assisted/locales
   ```
   Note that these commands need to be re-executed every time the `npm install` is run in the
   `frontend` directory.

## Updating the API types

The TypeScript types used by Assisted Installer UI are generated automatically from the
assisted-service's swagger file.  
These can be generated automatically by running:

```
yarn workspace @openshift-assisted/ui-lib update-api
```
