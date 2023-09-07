# Development

The project is developed in a [monorepo](https://monorepo.tools/), as such, it differentiates
between applications and libraries.

## Prerequisites

1. A Linux distro, like Fedora.
2. [NodeJS](https://nodejs.org/en) > v14, or newer LTS version.
3. [Yarn](https://yarnpkg.com/getting-started/install) (this project uses Yarn v3)
4. This project uses `rsync` in order to synchronize .css files in one of its build steps.
5. A back-end API to connect to. Please see instructions in
   [assisted-test-infra](https://github.com/openshift/assisted-test-infra).
6. [yalc](https://github.com/wclr/yalc#installation) (simulates a local package registry).
   ```bash
   # We recommend using npm in order to get the package installed globally:
   npm i -g yalc
   ```
   ```bash
   # Now, from a directory outside the project, verify the command works as expected
   yalc --version
   ```

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
5. Starting the project:
   1. <b id="watch-mode">Watch mode</b> (for developing integrations, see next section for more
      details)
      ```bash
      yarn start:watch_mode
      ```
   2. <b id="stand-alone-mode">Stand-alone mode</b> (browse to http://localhost:5173/ using a
      [modern web browser](https://caniuse.com/usage-table) after running this command).
      ```bash
      yarn start:assisted_ui
      ```

## Integrating with OCM (uhc-portal)

The Assisted Installer UI is consumed as a library at build-time by other applications.  
The [uhc-portal](https://gitlab.cee.redhat.com/service/uhc-portal.git) is one of them and is the
application you see at https://console.redhat.com/openshift.

Use this setup if you want to test the `libs/ui-lib` integration with the uhc-portal. These steps
apply for `libs/locales` as well.

1. In one terminal run the project in [watch mode](#watch-mode).  
   The script builds and publishes the `@openshift-assisted/ui-lib` and its workspace dependencies
   to the local registry everytime you'll make a change.
   ```bash
   yarn start:watch_mode
   ```
2. Fork and clone the uhc-portal project
   ```bash
   git clone https://gitlab.cee.redhat.com/<username>/uhc-portal.git
   ```
3. Inside the uhc-portal run the following commands
   ```bash
   yarn install
   yalc link @openshift-assisted/ui-lib
   yalc link @openshift-assisted/locales
   yalc link @openshift-assisted/types
   ```
   **Note**: `yalc link` needs to be executed following the `yarn install` command.  
   **Be aware that this command updates the project's `package.json` and `yarn.lock` files**.  
   **DO NOT COMMIT THESE CHANGES INTO VERSION CONTROL.**
4. Now you can follow the uhc-portal's
   [README file](https://gitlab.cee.redhat.com/service/uhc-portal/-/blob/master/README.md) in order
   to set up their dev-environment.

## Integrating with the Openshift Console for ACM and MCE (aka CIM)

Some components of the Assisted Installer UI are integrated into the Central Infrastructure
Management project (a.k.a. [stolostron/console](https://github.com/stolostron/console)).

Follow these steps if you want to test the `libs/ui-lib` integration within `stolostron/console`.

1. In one terminal run the project in [watch mode](#watch-mode).
   ```bash
   yarn start:watch_mode
   ```
2. Follow the stolostron/console
   [development setup guide](https://github.com/stolostron/console#running).
3. To use the locally published `@openshift-assisted/*` packages inside the `stolostron/console` run
   the following commands:
   ```bash
   cd frontend
   yalc add @openshift-assisted/ui-lib
   yalc link @openshift-assisted/locales
   yalc link @openshift-assisted/types
   ```
   **Note**: `yalc link` needs to be executed following the `npm install` command.  
   **Be aware that this command updates the project's `package.json` and `package-lock.json`
   files**.  
   **DO NOT COMMIT THESE CHANGES INTO VERSION CONTROL.**

## Updating the API types

The TypeScript types used by Assisted Installer UI are generated automatically from the
assisted-service's swagger file. Use this command to update them from their master branch.

```
yarn workspace @openshift-assisted/types update:assisted-installer-service
```

## Unit testing

This project uses [Vitest](https://vitest.dev/api/) for unit testing.

To run existing unit tests, call

```
yarn test:unit
```

To write a unit test, simply create/update a `*.test.ts` file.
