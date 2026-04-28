# UI Deployment Workflows — assisted-installer-ui

This document is mandatory reading for any agent working on this repository.
The codebase serves **four distinct deployment targets** that share components
but differ in routing, auth, API surface, and feature flags.
Before modifying any component, identify which workflow(s) it belongs to.

---

## Workflow 1 — OCM (Hybrid Cloud Console)

**App entry:** `apps/assisted-installer-app/src/components/RootApp.tsx`
**Live URL:** `console.redhat.com/openshift/assisted-installer-app`
**Code layer:** `libs/ui-lib/lib/ocm/`

### What it does
Full-featured multi-cluster installer embedded in the Red Hat Hybrid Cloud Console.
Provides a cluster list, a Day 1 wizard, a Day 2 "add hosts" flow, and a
post-install detail view — all behind Red Hat SSO authentication.

### Routing
```
/assisted-installer/clusters           → Clusters list (Clusters.tsx)
/assisted-installer/clusters/~new     → NewClusterPage → NewClusterWizard
/assisted-installer/clusters/:id      → ClusterPage (status-driven router)
```

`ClusterPage` switches on `cluster.status`:
- `pending-for-input`, `insufficient`, `ready` → **ClusterWizard** (Day 1)
- `preparing-for-installation` … `installed`, `error`, `cancelled` → **ClusterDetail**
- `adding-hosts` → **AddHosts** (Day 2)

### Day 1 wizard steps (ordered)
```
cluster-details
  └─ [static-ip-network-wide-configurations]
  └─ [static-ip-host-configurations]
  └─ [static-ip-yaml-view]
operators
host-discovery
storage
networking
[custom-manifests]   ← only if user adds manifests
review
```

### Day 2 wizard steps (modal, `Day2Wizard.tsx`)
```
cluster-details → generate-iso → download-iso
  └─ [static-ip sub-steps]
```

### Authentication
- `useChrome` from `@redhat-cloud-services/frontend-components` provides SSO.
- `buildAuthInterceptor` in `useInitApp.ts` prepends the OCM base URL and injects
  `Authorization: Bearer <token>` on every Axios request.
- Pull secret is fetched from AMS: `POST /api/accounts_mgmt/v1/access_token`.

### APIs called
**Assisted Service** (`https://api.openshift.com/api/assisted-install/v2/`):
- `ClustersAPI` — full CRUD, install/cancel/reset, credentials, logs, manifests,
  install-config, ui-settings, allow-add-workers, registerAddHosts, presigned URLs
- `InfraEnvsAPI` — full CRUD, image-url, iPXE URL
- `HostsAPI` — list, get, update, deregister, reset, install, bind
- `EventsAPI` — paginated events with severity filters
- `OperatorsAPI` — list supported operators
- `BundleAPI` — list operator bundles
- `NewFeatureSupportLevelsAPI` — features and architectures support levels
- `SupportedOpenshiftVersionsAPI` — all and latest OCP versions
- `ManagedDomainsAPI` — base DNS domain list

**AMS** (`https://api.openshift.com/api/accounts_mgmt/v1/`):
- `AccessTokenAPI` — pull secret
- `CurrentAccountApi` — user account / org ID
- `OrganizationsApi` — org capabilities (feature gating)

### Feature flags
Detected from AMS org capabilities via `getCapabilitiesAsync` in
`store/slices/current-user/slice.ts`, stored in `store/slices/feature-flags/`.
`ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE` is `false` in this flow.

### Key files
- `apps/assisted-installer-app/src/hooks/useInitApp.ts` — auth wiring
- `libs/ui-lib/lib/ocm/components/Routes.tsx` — route definitions
- `libs/ui-lib/lib/ocm/components/clusters/ClusterPage.tsx` — status router
- `libs/ui-lib/lib/ocm/components/clusterWizard/ClusterWizard.tsx` — step switcher
- `libs/ui-lib/lib/ocm/store/` — Redux slices: `clusters`, `current-cluster`,
  `current-user`, `feature-flags`, `infra-envs`

---

## Workflow 2 — Disconnected / ABI (Agent-Based Installer)

**App entry:** `apps/assisted-disconnected-ui/src/components/App.tsx`
**Started with:** `AIUI_APP_API_URL=<url> yarn start:assisted_disconnected_ui`
**Code layer:** `libs/ui-lib/lib/ocm/` (shared) + `apps/assisted-disconnected-ui/src/`

### What it does
A standalone, **single-cluster**, **no-auth** app for air-gapped / disconnected
environments. Talks directly to a local `assisted-service` instance. No cluster
list — the app is locked to one cluster at a time.

### Routing
```
/          → CreateClusterWizard (auto-redirects to /:id if a cluster exists)
/:clusterId → ClusterPage (SingleClusterPage)
```

On startup `useCluster()` calls `ClustersAPI.list()`. If a cluster already exists,
it navigates directly to `/:clusterId`. There is no "New Cluster" link.

### Wizard specifics
- `ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: true` is hardcoded — suppresses the
  cluster list and activates single-cluster behaviours throughout the shared wizard.
- Uses `disconnected-basic` and `disconnected-review` wizard step variants
  (defined in `wizardTransition.ts` as `disconnectedSteps`).
- `disconnected-basic` step includes an **Install Disconnected toggle**
  (`InstallDisconnectedSwitch`) — once the cluster draft is created this toggle
  is read-only.
- `ClusterPage` has a **Finalizer page** (`SingleClusterFinalizerPage`): detects
  when the bootstrap host is rebooting and the backend disappears, then surfaces
  the console URL before the service goes away.

### Authentication
None. `isInOcm` is `false`. The Axios client calls the local service directly
with no token interceptor.

### Pull secret
Fetched from a local bridge: `GET /api/pull-secret` (mounted Kubernetes Secret),
not from AMS.

### APIs called
Full Assisted Service subset (no AMS, no `ManagedDomainsAPI`, no `UISettingsAPI`):
- `ClustersAPI` — list (startup), getCredentials (finalizer), + all wizard APIs
- `InfraEnvsAPI` — full lifecycle + image URL
- `HostsAPI` — full lifecycle
- `EventsAPI`
- `OperatorsAPI`, `BundleAPI`
- `NewFeatureSupportLevelsAPI`, `SupportedOpenshiftVersionsAPI`
- Bridge: `GET /api/pull-secret`

### Key files
- `apps/assisted-disconnected-ui/src/components/App.tsx` — router + feature flag wiring
- `apps/assisted-disconnected-ui/src/hooks/useCluster.ts` — startup cluster detection
- `apps/assisted-disconnected-ui/src/components/ClusterPage.tsx` — finalizer logic
- `libs/ui-lib/lib/ocm/components/clusterWizard/wizardTransition.ts` — `disconnectedSteps`
- `libs/ui-lib/lib/ocm/components/clusterWizard/disconnected/` — BasicStep, ReviewStep,
  InstallDisconnectedSwitch

---

## Workflow 3 — ACM / CIM (Advanced Cluster Management)

**Consumed by:** Red Hat ACM / Multicluster Engine console
**Code layer:** `libs/ui-lib/lib/cim/` (primary) + `libs/ui-lib/lib/ocm/components/HostsClusterDetailTab/`

### What it does
The UI lib is consumed **as a library** by the ACM console. Components are rendered
inside ACM as embedded tabs or wizards. All Kubernetes mutations go through ACM's
own K8s client — the UI receives CRDs as **props** and fires callback functions;
it does not directly CRUD clusters or hosts.

### Two sub-flows

**a) AI Flow** (assisted installer with ISO-based host discovery):
- Entry: `ClusterDeploymentWizard` with an `InfraEnv` prop present (`isAIFlow = !!infraEnv`)
- Steps: `cluster-details → hosts-discovery → networking → [custom-manifests] → review`

**b) CIM Flow** (pre-provisioned hosts, no ISO):
- Entry: `ClusterDeploymentWizard` without `InfraEnv` (`isCIMFlow`)
- Steps: `cluster-details → hosts-selection → networking → review`

**Hypershift / HCP sub-flow:**
- Entry: `HostedClusterWizard` in `libs/ui-lib/lib/cim/components/Hypershift/`
- Steps: `DetailsStep → HostsStep → NetworkStep`

**Day 2 (HostsClusterDetailTab):**
- Entry: `HostsClusterDetailTab` — rendered by ACM as an "Add Hosts" tab on an
  installed cluster.
- Receives an `OcmClusterType` prop; internally creates a Day 2 Assisted Service
  cluster via `Day2ClusterService.getOrCreateDay2Cluster()`.

### Kubernetes resources (passed as props — not fetched by UI)
| CRD | API Group | Purpose |
|-----|-----------|---------|
| `ClusterDeployment` | `hive.openshift.io/v1` | Cluster definition |
| `AgentClusterInstall` | `extensions.hive.openshift.io/v1beta1` | Install config, status, validations |
| `Agent` | `agent-install.openshift.io/v1beta1` | Discovered hosts |
| `BareMetalHost` | `metal3.io/v1alpha1` | BMC-managed hosts |
| `InfraEnv` | `agent-install.openshift.io/v1beta1` | Infra env / ISO generation |
| `ClusterImageSet` | `hive.openshift.io/v1` | Available OCP versions |

### Assisted Service APIs (via K8s proxy)
All calls are tunnelled through the Kubernetes API server:
```
/api/v1/namespaces/open-cluster-management/services/https:assisted-service:8090/proxy
```
Only a subset is used — CRUD is handled by ACM controllers, not the UI:
- `EventsAPI` — events panel in `ClusterDeployment` detail view
- `NewFeatureSupportLevelsAPI` — features/architectures via `ACMFeatureSupportLevelProvider`

### Feature flags
`ACM_ENABLED_FEATURES` hardcodes `ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE: false`.
ACM passes its own `allEnabledFeatures` prop to `HostsClusterDetailTab`.

### Key files
- `libs/ui-lib/lib/cim/components/ClusterDeployment/ClusterDeploymentWizard.tsx`
- `libs/ui-lib/lib/cim/components/ClusterDeployment/helpers.ts` — `isCIMFlow`, `isAIFlow`,
  `getK8sProxyURL`
- `libs/ui-lib/lib/cim/components/ClusterDeployment/constants.ts` — wizard step names
- `libs/ui-lib/lib/cim/components/Hypershift/HostedClusterWizard/`
- `libs/ui-lib/lib/ocm/components/HostsClusterDetailTab/HostsClusterDetailTabContent.tsx`
- `libs/ui-lib/lib/cim/types/k8s/` — all K8s CRD TypeScript types
- `libs/ui-lib/lib/common/features/featureGate.tsx` — `ACM_ENABLED_FEATURES`

---

## Workflow 4 — Chatbot (LightSpeed AI Assistant)

**App entry:** `apps/assisted-chatbot/` (Webpack Module Federation remote)
**Consumed by:** OCM flow (`apps/assisted-installer-app`) as `<ChatBot />`
**Code layer:** `libs/chatbot/` + `apps/assisted-chatbot/src/`

### What it does
An AI assistant embedded in the OCM console that answers questions about the
Assisted Installer and can trigger cluster creation conversations. Rendered only
on routes matching `/openshift/assisted-installer/*`.

### Architecture
- Uses **Red Hat LightSpeed** (`@redhat-cloud-services/lightspeed-client`) as the
  AI backend at `https://assisted-chat.{api-hostname}` (hostname derived from the
  OCM base URL at runtime).
- Conversation state managed by `@redhat-cloud-services/ai-client-state`.
- The `MessageEntryComponent` is loaded lazily via **Scalprum** module federation
  (`scope: 'assistedInstallerApp'`, `module: './ChatbotMessageEntry'`).
- Streaming responses enabled (`streamMessages: true`).

### Authentication
Bearer token from `chrome.auth.getToken()` injected into every LightSpeed fetch.
AMS capability endpoints are queried (raw `fetch`, not Axios) to gate chatbot
availability.

### APIs called
- **LightSpeed** `https://assisted-chat.{api-hostname}` — streaming SSE conversations
- **AMS** (raw fetch, not Axios):
  - `GET /api/accounts_mgmt/v1/default_capabilities`
  - `GET /api/accounts_mgmt/v1/current_account`
  - `GET /api/accounts_mgmt/v1/organizations/:orgId?fetchCapabilities=true`

Does **not** call Assisted Service.

### Key files
- `apps/assisted-chatbot/src/hooks/useAsyncChatbot.tsx` — LightSpeed client setup,
  auth, conversation config
- `apps/assisted-chatbot/src/config.ts` — environment base URL resolution
- `apps/assisted-installer-app/src/components/Chatbot.tsx` — mount point in OCM app
- `libs/chatbot/lib/components/ChatBot/` — shared chatbot UI components

---

## Decision Guide for Agents

Use this table to decide where a change belongs before touching any file.

| Symptom / Task | Primary location |
|---|---|
| Bug in cluster list, cluster wizard, cluster detail | `libs/ui-lib/lib/ocm/components/` |
| Redux state / selector bug | `libs/ui-lib/lib/ocm/store/slices/` |
| Bug only in disconnected / single-cluster mode | Check `ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE` flag usage; may be in `apps/assisted-disconnected-ui/` or the `disconnected/` sub-folder of the wizard |
| Bug in ACM "Add Hosts" tab | `libs/ui-lib/lib/ocm/components/HostsClusterDetailTab/` |
| Bug in ACM cluster deployment wizard | `libs/ui-lib/lib/cim/components/ClusterDeployment/` |
| Bug visible in all flows | `libs/ui-lib/lib/common/` |
| API call returning wrong data / wrong endpoint | `libs/ui-lib/lib/common/api/assisted-service/` |
| Pull secret / auth bug (OCM only) | `libs/ui-lib/lib/ocm/hooks/usePullSecret.ts`, `useInitApp.ts` |
| Chatbot issue | `apps/assisted-chatbot/src/` |
| Feature flag not toggling correctly | `libs/ui-lib/lib/common/features/featureGate.tsx`, `store/slices/feature-flags/` |

---

## Critical Rules

- **Never add AMS or `ocmClient` calls inside `libs/ui-lib/lib/common/`** — the
  common layer must remain flow-agnostic.
- **Never call `ClustersAPI` / `HostsAPI` / `InfraEnvsAPI` directly from CIM
  components** — ACM manages those resources via K8s CRDs and callbacks.
- **`isInOcm`** (from `axiosClient.ts`) is the runtime flag that separates OCM from
  standalone/disconnected. Gate OCM-only behaviour behind it.
- **`ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE`** being `true` means single-cluster
  (disconnected) mode. Anything that hides the cluster list or suppresses InfraEnv
  creation must check this flag.
- Translations (`t('ai:...')`) live in `libs/ui-lib/lib/common/` and the OCM layer
  but **not** in `libs/ui-lib/lib/ocm/` sub-paths that use plain English strings
  — check `.cursor/rules/translations.mdc` for the exact boundary.
