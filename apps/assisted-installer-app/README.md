# Assisted Installer App

Assisted Installer App is a thin shell that wraps [`ui-lib/ocm`](../../libs/ui-lib/lib/ocm/) as a
micro-frontend for [uhc-portal](https://github.com/RedHatInsights/uhc-portal), the application
behind [console.redhat.com/openshift](https://console.redhat.com/openshift).

## Prerequisites

- Node.js >= 20.19 (see repo root `engines`)
- Yarn 3 — run `yarn install` from the **repository root**
- `/etc/hosts` entries for `*.foo.redhat.com` — run `yarn patch:hosts` in this app if needed

## Quick start

From the repository root:

```bash
yarn install
yarn build:assisted-installer-app
yarn start:assisted-installer-app
```

Visit
[https://prod.foo.redhat.com:1337/openshift/assisted-installer-app](https://prod.foo.redhat.com:1337/openshift/assisted-installer-app).

## uhc-portal development

By default, uhc-portal proxies requests for `assisted-installer-app` to the production CDN at
`https://console.redhat.com/apps/assisted-installer-app/`. To develop locally against your own copy
of the micro-frontend instead, start both projects:

1. In this monorepo:

   ```bash
   cd apps/assisted-installer-app && yarn start:federated
   ```

2. In uhc-portal:

   ```bash
   LOCAL_APPS=assisted-installer-app:8003 LOCAL_APP_HOST=localhost npm run dev
   ```

3. Visit
   [https://prod.foo.redhat.com:1337/openshift/assisted-installer](https://prod.foo.redhat.com:1337/openshift/assisted-installer).
