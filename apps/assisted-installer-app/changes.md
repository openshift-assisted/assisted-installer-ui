# Changes (Temporary file for code review)

**Assisted installer app (old):** `assisted-installer-app`

**Assisted installer ui (new):** `assisted-installer-ui/apps/assisted-installer-app`

Excluded: `node_modules`, `dist`, `.cache`, `coverage`, `.yalc`, lock files

Formatting-only differences (trailing commas, line wraps, whitespace) are ignored.

Lines where the only change is `useInitApp` → `initApp` are omitted from diffs.

## Modified files

### 1. README.md

**Assisted installer app:** `assisted-installer-app/README.md`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/README.md`

- Rewritten intro: thin shell around `ui-lib/ocm` for uhc-portal
- Replaced npm commands with yarn monorepo workflow
- Added Prerequisites section
- Quick start: `yarn build:assisted-installer-app` + `yarn start:assisted-installer-app`
- uhc-portal dev steps restructured as numbered list with `prod.foo.redhat.com` URL

````diff
--- a/README.md
+++ b/README.md
@@ -1,30 +1,45 @@
-# assisted-installer-app
+# Assisted Installer App

-Install npm dependencies and start the stage stable server
+Assisted Installer App is a thin shell that wraps [`ui-lib/ocm`](../../libs/ui-lib/lib/ocm/) as a
+micro-frontend for [uhc-portal](https://github.com/RedHatInsights/uhc-portal), the application
+behind [console.redhat.com/openshift](https://console.redhat.com/openshift).

-```
-npm install
-npm start
-```
-
-Visit https://stage.foo.redhat.com:1337/openshift/assisted-installer-app
+## Prerequisites

-## UHC-portal development
+- Node.js >= 20.19 (see repo root `engines`)
+- Yarn 3 — run `yarn install` from the **repository root**
+- `/etc/hosts` entries for `*.foo.redhat.com` — run `yarn patch:hosts` in this app if needed

-By default, uhc-portal proxies requests for `assisted-installer-app` to the production CDN at `https://console.redhat.com/apps/assisted-installer-app/`. To develop locally against your own copy of the micro-frontend instead, start both projects:
+## Quick start

-In assisted-installer-app, run:
+From the repository root:

-```
-npm install && npm run start:federated
+```bash
+yarn install
+yarn build:assisted-installer-app
+yarn start:assisted-installer-app
 ```

-This builds the Module Federation bundle and serves it on port 8003.
+Visit
+[https://prod.foo.redhat.com:1337/openshift/assisted-installer-app](https://prod.foo.redhat.com:1337/openshift/assisted-installer-app).

-In uhc-portal, run:
+## uhc-portal development

-```
-LOCAL_APPS=assisted-installer-app:8003 LOCAL_APP_HOST=localhost npm run dev
-```
+By default, uhc-portal proxies requests for `assisted-installer-app` to the production CDN at
+`https://console.redhat.com/apps/assisted-installer-app/`. To develop locally against your own copy
+of the micro-frontend instead, start both projects:
+
+1. In this monorepo:
+
+   ```bash
+   cd apps/assisted-installer-app && yarn start:federated
+   ```
+
+2. In uhc-portal:
+
+   ```bash
+   LOCAL_APPS=assisted-installer-app:8003 LOCAL_APP_HOST=localhost npm run dev
+   ```

-This tells the uhc-portal dev server to load `assisted-installer-app` from your local machine instead of the CDN, so changes you make here are reflected immediately in the portal.
+3. Visit
+   [https://prod.foo.redhat.com:1337/openshift/assisted-installer](https://prod.foo.redhat.com:1337/openshift/assisted-installer).
````

### 2. frontend.yaml

**Assisted installer app:** `assisted-installer-app/deploy/frontend.yaml`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/deploy/frontend.yaml`

- Updated `deploymentRepo` URL from assisted installer app repo to assisted installer ui

```diff
--- a/deploy/frontend.yaml
+++ b/deploy/frontend.yaml
@@ -13,7 +13,7 @@
-      deploymentRepo: https://github.com/openshift-assisted/assisted-installer-app
+      deploymentRepo: https://github.com/openshift-assisted/assisted-installer-ui
```

### 3. fec.config.js

**Assisted installer app:** `assisted-installer-app/fec.config.js`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/fec.config.js`

- Added assisted installer ui `nodeModulesDirectories: ../../node_modules`
- Added module federation shared config for `i18next` and `react-i18next`
- Removed `./FeatureSupportsLevel` expose (unused after uhc-portal decoupling)
- Removed chatbot module federation exposes (`ChatbotMessageEntry`, `useAsyncChatbot`)

```diff
--- a/fec.config.js
+++ b/fec.config.js
@@ -1,4 +1,8 @@
+const { dependencies } = require('./package.json');
+
+const i18nextVersion = require('../../node_modules/i18next/package.json').version;
+const reactI18nextVersion = require('../../node_modules/react-i18next/package.json').version;
@@ -22,29 +26,36 @@
+  nodeModulesDirectories: '../../node_modules',
+    shared: [
+      {
+        i18next: {
+          singleton: true,
+          eager: true,
+          requiredVersion: dependencies.i18next,
+          version: i18nextVersion,
+        },
+      },
+      {
+        'react-i18next': {
+          singleton: true,
+          eager: true,
+          requiredVersion: dependencies['react-i18next'],
+          version: reactI18nextVersion,
+        },
+      },
+    ],
@@ -44,11 +58,3 @@
       './ClusterStatus': path.resolve(
         __dirname,
         './src/components/ClusterStatus.tsx',
       ),
-      './FeatureSupportsLevel': path.resolve(
-        __dirname,
-        './src/components/FeatureSupportsLevel.tsx',
-      ),
       './HostsClusterDetailTab': path.resolve(
@@ -53,22 +64,8 @@
-      './ChatbotMessageEntry': path.resolve(
-        __dirname,
-        './src/components/chatbot/ChatbotMessageEntry.tsx',
-      ),
-      './useAsyncChatbot': path.resolve(
-        __dirname,
-        './src/components/chatbot/useAsyncChatbot.tsx',
-      ),
```

### 4. package.json

**Assisted installer app:** `assisted-installer-app/package.json`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/package.json`

- Scoped package name: `@openshift-assisted/assisted-installer-app`
- Node engine bumped to `>=20.19.0`
- Scripts simplified for assisted installer ui (`yarn run -T`, removed jest/test/deploy)
- Dependencies switched to `workspace:*` for assisted packages
- Removed chatbot deps and test/lint devDependencies (handled at assisted installer ui root)

```diff
--- a/package.json
+++ b/package.json
@@ -1,76 +1,48 @@
-  "name": "assisted-installer-app",
-    "node": ">=16.0.0",
-    "clean": "rimraf node_modules dist .cache",
-    "deploy": "npm-run-all build lint test",
-    "lint": "npm-run-all lint:*",
-    "lint:js": "eslint src",
-    "lint:js:fix": "eslint src --fix",
-    "start:federated": "fec static",
-    "test": "TZ=UTC jest --verbose --no-cache --passWithNoTests",
-    "postinstall": "ts-patch install && rimraf .cache",
-    "verify": "npm-run-all build lint test",
-    "prettier": "prettier --write src",
-    "static": "fec static"
-    "@openshift-assisted/chatbot": "0.1.19-chatbot",
-    "@openshift-assisted/locales": "2.55.0",
-    "@openshift-assisted/types": "2.55.0",
-    "@openshift-assisted/ui-lib": "2.55.0",
-    "@patternfly/chatbot": "6.4.1",
-    "@patternfly/react-code-editor": "6.4.1",
-    "@patternfly/react-table": "6.4.1",
-    "@redhat-cloud-services/ai-client-state": "^0.15.0",
-    "@unleash/proxy-client-react": "^5.0.0",
-    "parse-url": "^10.0.0",
-    "preact": "10.29.7"
-    "@redhat-cloud-services/eslint-config-redhat-cloud-services": "^2.0.3",
-    "@swc/core": "^1.3.96",
-    "@swc/jest": "^0.2.29",
-    "@testing-library/jest-dom": "^6.1.4",
-    "@testing-library/react": "^16.0.0",
-    "@types/redux-logger": "^3.0.12",
-    "@typescript-eslint/eslint-plugin": "^6.11.0",
-    "@typescript-eslint/parser": "^6.11.0",
-    "eslint": "^8.53.0",
-    "identity-obj-proxy": "^3.0.0",
-    "jest-environment-jsdom": "^29.7.0",
-    "jest_workaround": "^0.79.19",
-    "npm-run-all2": "^9.0.0",
-    "rimraf": "^6.0.0",
-    "ts-jest": "^29.1.1",
-    "typescript": "^5.2.2",
-    "webpack-bundle-analyzer": "5.3.1"
+  "name": "@openshift-assisted/assisted-installer-app",
+    "node": ">=20.19.0",
+    "check_types": "yarn run -T tsc --noEmit",
+    "clean": "yarn run -T rimraf node_modules dist .cache",
+    "format": "yarn run -T prettier --cache --check . \"!dist\"",
+    "fix-code-style": "yarn lint --fix && yarn format --write",
+    "lint": "yarn run -T eslint --cache --cache-location node_modules/.cache/eslint/.eslint-cache .",
+    "start:federated": "fec static --config ../../node_modules/@redhat-cloud-services/frontend-components-config/bin/prod.webpack.config.js",
+    "postinstall": "ts-patch install"
+    "@openshift-assisted/locales": "workspace:*",
+    "@openshift-assisted/types": "workspace:*",
+    "@openshift-assisted/ui-lib": "workspace:*",
+    "typescript": "^5.9.3"
```

### 5. HostsClusterDetailTab.tsx

**Assisted installer app:** `assisted-installer-app/src/components/HostsClusterDetailTab.tsx`

**Assisted installer ui:**
`assisted-installer-ui/apps/assisted-installer-app/src/components/HostsClusterDetailTab.tsx`

- Replaced `HostsClusterDetailTabProps` import with
  `React.ComponentProps<typeof AIHostsClusterDetailTab>`
- Removed `@openshift-assisted/ui-lib/build/@types/...` import

```diff
--- a/src/components/HostsClusterDetailTab.tsx
+++ b/src/components/HostsClusterDetailTab.tsx
@@ -1,11 +1,12 @@
-import { HostsClusterDetailTabProps } from '@openshift-assisted/ui-lib/build/@types/ocm/components/HostsClusterDetailTab/types';
-const HostsClusterDetailTab: React.FC<HostsClusterDetailTabProps> = (props) => {
+const HostsClusterDetailTab: React.FC<React.ComponentProps<typeof AIHostsClusterDetailTab>> = (
+  props,
+) => {
```

### 6. RootApp.tsx

**Assisted installer app:** `assisted-installer-app/src/components/RootApp.tsx`

**Assisted installer ui:**
`assisted-installer-ui/apps/assisted-installer-app/src/components/RootApp.tsx`

- Removed `HistoryRouter` wrapper and `ChatBot` component
- Routes now receive `history` and `basename` props directly

```diff
--- a/src/components/RootApp.tsx
+++ b/src/components/RootApp.tsx
@@ -1,27 +1,19 @@
-import {
-  unstable_HistoryRouter as HistoryRouter,
-  HistoryRouterProps,
-} from 'react-router';
-import ChatBot from './Chatbot';
-      <HistoryRouter history={history} basename={basename}>
-        <div>
-          <Routes allEnabledFeatures={{}} />
-          <ChatBot />
-        </div>
-      </HistoryRouter>
+import { HistoryRouterProps } from 'react-router';
+
+      <Routes allEnabledFeatures={{}} history={history} basename={basename} />
```

### 7. computeAIClusterMetrics.ts

**Assisted installer app:** `assisted-installer-app/src/components/computeAIClusterMetrics.ts`

**Assisted installer ui:**
`assisted-installer-ui/apps/assisted-installer-app/src/components/computeAIClusterMetrics.ts`

- Added explicit `AIClusterMetrics` return type
- Imported `Host` type and typed `hosts` as `Host[]`

```diff
--- a/src/components/computeAIClusterMetrics.ts
+++ b/src/components/computeAIClusterMetrics.ts
@@ -4,10 +4,17 @@
-import type { Cluster } from '@openshift-assisted/types/assisted-installer-service';
-export const computeAIClusterMetrics = (aiCluster: Cluster) => {
-  const hosts = aiCluster?.hosts ?? [];
+import type { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';
+type AIClusterMetrics = {
+  masterCount: number;
+  workerCount: number;
+  memoryTotal: number;
+  cpuTotal: number;
+};
+
+export const computeAIClusterMetrics = (aiCluster: Cluster): AIClusterMetrics => {
+  const hosts: Host[] = aiCluster?.hosts ?? [];
```

### 8. tsconfig.json

**Assisted installer app:** `assisted-installer-app/tsconfig.json`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/tsconfig.json`

- `moduleResolution`: `node` → `bundler`
- `target`: `es5` → `ES2020`
- Added project reference to `../../libs/ui-lib`

```diff
--- a/tsconfig.json
+++ b/tsconfig.json
@@ -4,8 +4,8 @@
-    "moduleResolution": "node",
-    "target": "es5",
+    "moduleResolution": "bundler",
+    "target": "ES2020",
@@ -29,4 +29,9 @@
   ]
-}
+  ],
+  "references": [
+    {
+      "path": "../../libs/ui-lib"
+    }
+  ]
+}
```

### 9. .eslintrc.js → .eslintrc.cjs

**Assisted installer app:** `assisted-installer-app/.eslintrc.js`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/.eslintrc.cjs`

- Switched to `@openshift-assisted/eslint-config`
- Added restricted imports for `react-i18next` and `@openshift-assisted/ui-lib`
- Added `EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true` in `parserOptions`

```diff
--- a/.eslintrc.js
+++ b/.eslintrc.cjs
@@ -1,28 +1,32 @@
-  extends: '@redhat-cloud-services/eslint-config-redhat-cloud-services',
-  globals: {
-    insights: 'readonly',
-      files: ['src/**/*.ts', 'src/**/*.tsx'],
-      parser: '@typescript-eslint/parser',
-      plugins: ['@typescript-eslint'],
-      extends: ['plugin:@typescript-eslint/recommended'],
-        'react/prop-types': 'off',
-        '@typescript-eslint/no-unused-vars': 'error',
-  rules: {
-    'sort-imports': [
-        ignoreDeclarationSort: true,
-    // Enable this if you want to use absolute import paths
-    'rulesdir/forbid-pf-relative-imports': 'off',
+/** @type {import('eslint').ESLint.ConfigData} */
+  ignorePatterns: ['src/entry.ts'],
+      files: ['./src/**/*.{ts,tsx}'],
+      extends: ['@openshift-assisted/eslint-config', 'plugin:react/jsx-runtime'],
+      parserOptions: {
+        tsconfigRootDir: __dirname,
+        EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
+        'no-restricted-imports': [
+            paths: [
+              {
+                name: 'react-i18next',
+                importNames: ['useTranslation'],
+                message: 'Import `useTranslation` from `@openshift-assisted/ui-lib/common` instead',
+              {
+                name: '@openshift-assisted/ui-lib',
+                message: 'Import from `@openshift-assisted/ui-lib/ocm` instead',
+          },
+        ],
```

### 10. useInitApp.ts → initApp.ts

**Assisted installer app:** `assisted-installer-app/src/hooks/useInitApp.ts`

**Assisted installer ui:** `assisted-installer-ui/apps/assisted-installer-app/src/init/initApp.ts`

- Moved from `src/hooks/` to `src/init/`
- Renamed export `useInitApp` → `initApp`
- Added nullish coalescing for `config.url` in auth interceptor

```diff
--- a/src/hooks/useInitApp.ts
+++ b/src/init/initApp.ts
@@ -20,7 +20,7 @@
-      config.url = `${BASE_URL}${config.url}`;
+      config.url = `${BASE_URL}${config.url ?? ''}`;
@@ -28,7 +28,7 @@
-export const useInitApp = () => {
+export const initApp = () => {
```

## Dropped in assisted installer ui

Files present in assisted installer app but absent from assisted installer ui.

1. `assisted-installer-app/.eslintignore`
2. `assisted-installer-app/.eslintrc.js` _(renamed to `.eslintrc.cjs`)_
3. `assisted-installer-app/.github/workflows/pull-request.yaml`
4. `assisted-installer-app/.github/workflows/push-to-main.yaml`
5. `assisted-installer-app/.gitignore`
6. `assisted-installer-app/.gitmodules`
7. `assisted-installer-app/.prettierrc`
8. `assisted-installer-app/.stylelintrc.json`
9. `assisted-installer-app/.tekton/assisted-installer-app-saas-main-pull-request.yaml`
10. `assisted-installer-app/.tekton/assisted-installer-app-saas-main-push.yaml`
11. `assisted-installer-app/LICENSE`
12. `assisted-installer-app/bump-assisted.sh`
13. `assisted-installer-app/config/empty.js`
14. `assisted-installer-app/config/jest.setup.js`
15. `assisted-installer-app/jest.config.js`
16. `assisted-installer-app/src/assets/Ask_Red_Hat_OFFICIAL-whitebackground.svg`
17. `assisted-installer-app/src/components/Chatbot.scss`
18. `assisted-installer-app/src/components/Chatbot.tsx`
19. `assisted-installer-app/src/components/chatbot/AsyncMessagePlaceholder.scss`
20. `assisted-installer-app/src/components/chatbot/AsyncMessagePlaceholder.tsx`
21. `assisted-installer-app/src/components/chatbot/ChatbotMessageEntry.tsx`
22. `assisted-installer-app/src/components/chatbot/types.ts`
23. `assisted-installer-app/src/components/chatbot/useAsyncChatbot.tsx`
24. `assisted-installer-app/src/components/FeatureSupportsLevel.tsx`
25. `assisted-installer-app/src/hooks/useAMSCapability.ts`
26. `assisted-installer-app/src/hooks/useInitApp.ts` _(moved to `src/init/initApp.ts`)_
27. `assisted-installer-app/src/hooks/useUsername.ts`
28. `assisted-installer-app/src/typings.d.ts`
