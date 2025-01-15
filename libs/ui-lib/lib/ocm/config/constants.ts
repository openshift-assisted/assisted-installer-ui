import {
  AssistedInstallerOCMPermissionTypesListType,
  AssistedInstallerPermissionTypesListType,
} from '../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

/* Used from Integration tests so we can mock the permissions */
export type ExtendedCluster = Cluster & {
  permissions: AssistedInstallerOCMPermissionTypesListType;
};

export const getBasePermissions = (
  cluster: ExtendedCluster,
): AssistedInstallerPermissionTypesListType => {
  if (cluster.permissions) {
    return { isViewerMode: !cluster.permissions.canEdit };
  }

  const basePermissions = { isViewerMode: false };
  if (!process.env.AIUI_APP_CLUSTER_PERMISSIONS) {
    return basePermissions;
  }
  const ocmPermissions = JSON.parse(
    process.env.AIUI_APP_CLUSTER_PERMISSIONS,
  ) as AssistedInstallerOCMPermissionTypesListType;

  return {
    ...basePermissions,
    ...ocmPermissionsToAIPermissions(ocmPermissions),
  };
};

export const ocmPermissionsToAIPermissions = (
  ocmPermissions: AssistedInstallerOCMPermissionTypesListType,
): Partial<AssistedInstallerPermissionTypesListType> => {
  const permissions: Partial<AssistedInstallerPermissionTypesListType> = {};
  if (ocmPermissions.canEdit !== undefined) {
    permissions.isViewerMode = !ocmPermissions.canEdit;
  }
  return permissions;
};

//TO-DO: Assisted-Migration. Provisional code. Needs to be removed when MTV integration be finished
export const yamlContentAssistedMigration1 = `apiVersion: v1
kind: Namespace
metadata:
  name: openshift-gitops-operator
---
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: openshift-gitops-operator
  namespace: openshift-gitops-operator
spec:
  upgradeStrategy: Default
---
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: openshift-gitops-operator
  namespace: openshift-gitops-operator
spec:
  channel: latest
  installPlanApproval: Automatic
  name: openshift-gitops-operator
  source: redhat-operators
  sourceNamespace: openshift-marketplace
`;

export const yamlContentAssistedMigration2 = `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: namespace-manager
rules:
  - apiGroups: [""]
    resources: ["namespaces"]
    verbs: ["get", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: namespace-manager-binding
subjects:
  - kind: ServiceAccount
    name: openshift-gitops-argocd-application-controller
    namespace: openshift-gitops
roleRef:
  kind: ClusterRole
  name: namespace-manager
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: persistentvolumeclaim-manager
  namespace: openshift-image-registry
rules:
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: persistentvolumeclaim-manager-binding
  namespace: openshift-image-registry
subjects:
  - kind: ServiceAccount
    name: openshift-gitops-argocd-application-controller
    namespace: openshift-gitops
roleRef:
  kind: Role
  name: persistentvolumeclaim-manager
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: job-manager
rules:
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs: ["get", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: job-manager-binding
subjects:
  - kind: ServiceAccount
    name: openshift-gitops-argocd-application-controller
    namespace: openshift-gitops
roleRef:
  kind: ClusterRole
  name: job-manager
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argocd-application-controller
rules:
  - apiGroups: [""]
    resources: ["serviceaccounts", "services", "secrets"]
    verbs: ["create", "get", "list", "update", "delete", "patch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["create", "get", "list", "update", "delete", "patch"]
  - apiGroups: ["route.openshift.io"]
    resources: ["routes"]
    verbs: ["create", "get", "list", "update", "delete", "patch"]
  - apiGroups: ["image.openshift.io"]
    resources: ["imagestreams"]
    verbs: ["create", "get", "list", "update", "delete", "patch"]
  - apiGroups: ["build.openshift.io"]
    resources: ["buildconfigs"]
    verbs: ["create", "get", "list", "update", "delete", "patch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: argocd-application-controller-binding
subjects:
  - kind: ServiceAccount
    name: openshift-gitops-argocd-application-controller
    namespace: openshift-gitops
roleRef:
  kind: ClusterRole
  name: argocd-application-controller
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: argocd-secrets-role
  namespace: openshift-mtv
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["create", "get", "list", "update", "delete", "patch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: argocd-secrets-rolebinding
  namespace: openshift-mtv
subjects:
  - kind: ServiceAccount
    name: openshift-gitops-argocd-application-controller
    namespace: openshift-gitops
roleRef:
  kind: Role
  name: argocd-secrets-role
  apiGroup: rbac.authorization.k8s.io
`;
