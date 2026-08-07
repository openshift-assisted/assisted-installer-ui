# Assisted Installer App (Red Hat Console)

The Assisted Installer UI ([`@openshift-assisted/ui-lib`](../../libs/ui-lib/)) is consumed as a
library at build-time by other applications.
[uhc-portal](https://github.com/RedHatInsights/uhc-portal) is the main one — it is the application
behind [console.redhat.com/openshift](https://console.redhat.com/openshift).

This app is the **micro-frontend shell** for that integration: a thin wrapper around
[`@openshift-assisted/ui-lib/ocm`](../../libs/ui-lib/) that exposes Assisted Installer components to
the Hybrid Cloud Console via Module Federation.

It lives in the [assisted-installer-ui](../../) monorepo at `apps/assisted-installer-app/`.

## Prerequisites

- Node.js >= 20.19 (see repo root `engines`)
- Yarn 3 — run `yarn install` from the **repository root**
- `/etc/hosts` entries for `*.foo.redhat.com` — run `yarn patch:hosts` in this app if needed

## Quick start (standalone dev server)

Runs the app with hot reload via `fec dev`. Use this when working on this shell only — the app
serves itself; you do not need uhc-portal.

From the repository root:

```bash
yarn install
yarn workspace @openshift-assisted/assisted-installer-app start
```

Open
[https://prod.foo.redhat.com:1337/openshift/assisted-installer-app](https://prod.foo.redhat.com:1337/openshift/assisted-installer-app).

## Run inside the Hybrid Cloud Console locally

In production, [console.redhat.com](https://console.redhat.com/) loads this app as a small remote
bundle (Module Federation) from a CDN. To develop the same way locally — embedded in the Console UI
rather than standalone — serve that bundle on port **8003**:

```bash
yarn build:assisted-installer-app
yarn start:assisted_installer_app
```

Or from this directory: `yarn start:federated`.

### uhc-portal development

Use this when you are changing **uhc-portal** and need your local **assisted-installer-app** changes
to show up in the Console shell.

By default, [uhc-portal](https://github.com/RedHatInsights/uhc-portal) proxies requests for
`assisted-installer-app` to the production CDN at
`https://console.redhat.com/apps/assisted-installer-app/`. To use your local build on port **8003**
instead, run both projects:

1. In this monorepo:

   ```bash
   cd apps/assisted-installer-app && yarn start:federated
   ```

2. In uhc-portal:

   ```bash
   LOCAL_APPS=assisted-installer-app:8003 LOCAL_APP_HOST=localhost npm run dev
   ```

3. Open
   [https://prod.foo.redhat.com:1337/openshift/assisted-installer](https://prod.foo.redhat.com:1337/openshift/assisted-installer).

## ui-lib changes

If you also changed `libs/ui-lib`, rebuild the library and restart this app:

```bash
yarn workspace @openshift-assisted/ui-lib build
```

For ongoing ui-lib work across multiple consuming apps, use watch mode from the repo root (see
[Development guide](../../docs/DEVELOPMENT.md#watch-mode)):

```bash
yarn start:watch_mode
```
