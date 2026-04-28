# Universal Instructions for assisted-installer-ui

These instructions apply to every task — bug fixes and CVE remediations alike.
Read this file fully before touching any code.

---

## Repository Overview

Yarn workspaces monorepo. One shared library (`ui-lib`) consumed by three deployment targets:

| App | Directory | Description |
|---|---|---|
| OCM (cloud) | `apps/assisted-ui/` | Main OpenShift Console flow |
| Disconnected/ABI | `apps/assisted-disconnected-ui/` | Air-gapped / Agent-Based Installer UI |
| Chatbot | `apps/assisted-chatbot/` | AI-assisted installer chatbot |

**Rule:** A bug in the OCM wizard may not exist in the disconnected flow — always check which deployment target the issue describes before editing.

---

## Directory Map

```
libs/
  ui-lib/lib/
    common/           ← shared across ALL deployment targets
      api/            ← axios clients for assisted-service, AMS, auth
      components/     ← base components (hosts table, wizard shell, forms)
        clusterConfiguration/   ← forms: discovery image, SSH, proxy, certs, disk encryption
        clusterWizard/          ← wizard step shell, validations, step navigation logic
        hosts/                  ← host table, hostname, roles, disk, NTP components
        featureSupportLevels/   ← old FSL badge/context
        newFeatureSupportLevels/ ← new FSL badge/context (prefer this one)
      hooks/          ← shared hooks (useStateSafely, useDeepCompareMemoize, etc.)
      reducers/       ← shared Redux reducers
      selectors/      ← shared selectors
      types/          ← TypeScript interfaces (Cluster, Host, Validation, etc.)
      validationSchemas/ ← Yup schemas shared across flows

    ocm/              ← OCM-specific (cloud installer wizard)
      components/
        clusterConfiguration/
          operators/          ← OperatorCheckbox, bundleSpecs, utils
          networkConfiguration/ ← NetworkConfiguration, NetworkConfigurationForm
          platformIntegration/  ← ExternalPlatformDropdown, PlatformIntegrationNote
          staticIp/           ← static IP YAML and host-specific configuration
          review/             ← ReviewStep, cluster summary before install
        clusterDetail/        ← ClusterDetail, ClusterProgress, event feed
        clusterWizard/        ← ClusterWizard, step transitions, wizard navigation
          wizardTransition.ts ← WIZARD STEP ORDER — edit with care
        clusters/             ← cluster list page, cluster card
        featureSupportLevels/ ← OCM FSL provider, ReviewClusterFeatureSupportLevels
        fetching/             ← polling, background data fetching
        hosts/                ← OCM-specific host table wrappers
        AddHosts/             ← Day 2 add-hosts wizard
      store/slices/
        current-cluster/      ← slice + selectors for the active cluster object
        clusters/             ← slice for the cluster list
        current-user/         ← slice for user permissions
        feature-flags/        ← slice for Unleash feature flags
        infra-envs/           ← slice for infrastructure environments

    cim/              ← ACM/CIM flow (cluster-image-management, on-premise MCE)
      components/     ← CIM-specific components
      hooks/          ← CIM-specific hooks
      types/          ← CIM type extensions

  ui-lib-tests/
    cypress/
      integration/    ← E2E specs grouped by feature:
        create-multinode/ create-sno/ day-2/ static-ip/ storage/
        dualstack/ custom-manifests/ features/ ui-behaviour/ use-cases/

  sdks/lib/          ← auto-generated OpenAPI clients (do NOT edit by hand)
    assisted-service/ ← models + API from assisted-service OpenAPI spec
    accounts-management-service/

  locales/           ← i18n translation files (en.json + others)
  types/             ← @openshift-assisted/types package (shared type definitions)
```

---

## Wizard Step Order (OCM)

Defined in `libs/ui-lib/lib/ocm/components/clusterWizard/wizardTransition.ts`:

```
cluster-details → [static-ip steps] → operators → host-discovery →
storage → networking → custom-manifests → review → credentials-download
```

Disconnected flow uses `disconnected-basic` and `disconnected-review` instead.
Do not reorder steps without checking `wizardStepsValidationsMap` in the same file.

---

## Jira Issue Key → UI Flow

The Jira project prefix tells you which UI flow is affected:

| Key prefix | Flow | Primary directory |
|---|---|---|
| `MGMT-` | OCM (cloud installer) | `libs/ui-lib/lib/ocm/` |
| `ACM-` | ACM / CIM (on-premise MCE) | `libs/ui-lib/lib/cim/` |

Use this to immediately narrow your search to the right directory before reading any code.

---

## Stack

- **TypeScript strict** — no `any`, prefer `interface` over `type`
- **React** — functional components only, no class components
- **PatternFly 6** — `@patternfly/react-core@6.x`; **always prefer PF components over raw HTML**
- **Formik** — all form state; access via `useFormikContext<T>()`
- **Redux Toolkit** — state management; read via selectors in `store/slices/*/selectors.ts`
- **Vitest** — unit tests, collocated with source (`*.test.ts` / `*.test.tsx`)
- **Cypress** — integration tests in `libs/ui-lib-tests/cypress/integration/`
- **i18next** — all user-visible strings must use `useTranslation` / `t()`

---

## PatternFly Component Rules

**Always use PatternFly components. Never use raw HTML elements for UI.**

| Instead of | Use |
|---|---|
| `<div>`, `<section>`, `<article>` | `<PageSection>`, `<Stack>`, `<Flex>`, `<Grid>` |
| `<button>` | `<Button variant="primary/secondary/link/plain">` |
| `<input>`, `<textarea>`, `<select>` | `<TextInput>`, `<TextArea>`, `<FormSelect>` |
| `<form>` | `<Form>` with `<FormGroup>` and `<FormHelperText>` |
| `<ul>/<li>` | `<List>` / `<ListItem>` |
| `<table>` | `<Table>` from `@patternfly/react-table` |
| `<span class="error">` | `<HelperText><HelperTextItem variant="error">` |
| `<p>` (body text) | `<TextContent><Text component="p">` |
| `<h1>`–`<h6>` | `<TextContent><Text component="h1">` etc. |
| Custom spinner/loading | `<Spinner>`, `<Bullseye>` |
| Custom empty state | `<EmptyState>` with `<EmptyStateHeader>`, `<EmptyStateBody>` |
| Custom alert/banner | `<Alert variant="info/warning/danger/success">` |
| Custom modal | `<Modal>` or `<ModalBoxBody>` |
| Custom tooltip | `<Tooltip content="...">` |
| Inline icon + text | `<Icon>` wrapper + PF icon component |

**Rules:**
- Import from `@patternfly/react-core` (components) or `@patternfly/react-table` (tables).
- Do not add custom CSS classes for layout — use PF's `Stack`, `Flex`, `Grid` with spacing props.
- Do not write inline `style={{}}` for spacing — use PF's `spacer` props (`spaceItems`, `gapItems`, etc.).
- Check existing components in the same directory first — PF patterns are already established.

---

## Key Patterns to Follow

### Redux state
- Read state via selectors: `selectCurrentCluster`, `selectCurrentClusterPermissionsState`, `selectIsCurrentClusterSNO`, etc.
- Never call `store.getState()` directly in components.
- Add new selectors to `libs/ui-lib/lib/ocm/store/slices/*/selectors.ts`.

### Feature flags
- OCM feature flags live in `store/slices/feature-flags/`.
- Component-level feature gating uses `useNewFeatureSupportLevel()` (not the old `useFeatureSupportLevel`).
- Support level badges: use `NewFeatureSupportLevelBadge`, not the legacy `FeatureSupportLevelBadge`.

### Operators
- Operator specs are defined in `bundleSpecs.tsx` and rendered via `OperatorCheckbox`.
- Operator field values are typed `OperatorsValues` from `libs/ui-lib/lib/common`.
- Do not add operator logic in `apps/assisted-ui/`; it belongs in `libs/ui-lib/lib/ocm/components/clusterConfiguration/operators/`.

### API / types
- API models come from `@openshift-assisted/types/assisted-installer-service` (the `libs/types` package).
- Do NOT edit files in `libs/sdks/lib/` — they are auto-generated from OpenAPI specs.
- Use `libs/ui-lib/lib/common/api/assisted-service/` for API calls; do not call axios directly.

### i18n
- Wrap all new user-visible strings with `t('key', 'English fallback')` from `useTranslation()`.
- After adding new strings run `yarn process_new_strings` to update translation files.
- The locales validation CI step will fail if translation files are out of sync.

### Where fixes belong
- Bug in a shared component → `libs/ui-lib/lib/common/`
- Bug in OCM-specific component → `libs/ui-lib/lib/ocm/`
- Bug in CIM flow → `libs/ui-lib/lib/cim/`
- Bug only in the standalone app shell → `apps/assisted-ui/`
- Never duplicate logic across these layers.

---

## Validation Commands (run in this order)

```bash
yarn build:all               # TypeScript compile + bundle — must be error-free
yarn fix-code-style:all      # auto-fix Prettier + ESLint (run before lint)
yarn lint:all                # ESLint — must report 0 errors
yarn test:unit               # Vitest unit tests — all must pass
# CVE flow only:
yarn audit --level high      # must report 0 high/critical findings
```

---

## Writing Tests

- **Unit tests**: place next to the file under test as `ComponentName.test.tsx`.
  Use Vitest + `@testing-library/react`. Mock Redux store with `renderWithStore()` if available.
- **Integration tests**: add specs under `libs/ui-lib-tests/cypress/integration/`.
  Cypress specs use MSW-backed mock data in `libs/ui-lib-tests/cypress/fixtures/`.
- Write the failing test **before** fixing the bug (TDD).

---

## After Making Changes

1. `yarn build:all` — fix all TypeScript errors first
2. `yarn fix-code-style:all` — auto-fix formatting
3. `yarn lint:all` — fix any remaining ESLint errors
4. `yarn test:unit` — all Vitest tests must pass
5. If new i18n strings were added: `yarn process_new_strings`
6. Write `.ai-bot/pr.md` with a concise PR description
