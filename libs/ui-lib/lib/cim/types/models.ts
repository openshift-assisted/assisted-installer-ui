import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const SecretModel: K8sModel = {
  apiVersion: 'v1',
  label: 'Secret',
  plural: 'secrets',
  abbr: 'S',
  namespaced: true,
  kind: 'Secret',
  labelPlural: 'Secrets',
};

export const RoleModel: K8sModel = {
  label: 'Role',
  apiGroup: 'rbac.authorization.k8s.io',
  apiVersion: 'v1',
  plural: 'roles',
  abbr: 'R',
  namespaced: true,
  kind: 'Role',
  labelPlural: 'Roles',
};

export const InfraEnvModel: K8sModel = {
  label: 'InfraEnv',
  apiGroup: 'agent-install.openshift.io',
  apiVersion: 'v1beta1',
  plural: 'infraenvs',
  abbr: 'IE',
  namespaced: true,
  kind: 'InfraEnv',
  labelPlural: 'InfraEnvs',
};

export const AgentServiceConfigModel: K8sModel = {
  label: 'AgentServiceConfig',
  apiGroup: 'agent-install.openshift.io',
  apiVersion: 'v1beta1',
  plural: 'agentserviceconfigs',
  abbr: 'ASC',
  namespaced: true,
  kind: 'AgentServiceConfig',
  labelPlural: 'AgentServiceConfigs',
};

export const NamespaceModel: K8sModel = {
  label: 'Namespace',
  apiVersion: 'v1',
  plural: 'namespaces',
  abbr: 'NS',
  namespaced: false,
  kind: 'Namespace',
  labelPlural: 'Namespaces',
};

export const MCEModel: K8sModel = {
  label: 'MultiClusterEngine',
  apiVersion: 'v1',
  plural: 'multiclusterengines',
  abbr: 'MCE',
  namespaced: false,
  kind: 'MultiClusterEngine',
  labelPlural: 'MultiClusterEngines',
  apiGroup: 'multicluster.openshift.io',
};

export const AgentModel: K8sModel = {
  label: 'Agent',
  apiVersion: 'v1beta1',
  plural: 'agents',
  abbr: 'A',
  namespaced: true,
  kind: 'Agent',
  labelPlural: 'Agents',
  apiGroup: 'agent-install.openshift.io',
};

export const BMHModel: K8sModel = {
  label: 'BareMetalHost',
  apiVersion: 'v1alpha1',
  plural: 'baremetalhosts',
  abbr: 'BMH',
  namespaced: true,
  kind: 'BareMetalHost',
  labelPlural: 'BareMetalHosts',
  apiGroup: 'metal3.io',
};

export const NMStateModel: K8sModel = {
  label: 'NMStateConfig',
  apiVersion: 'v1beta1',
  plural: 'nmstateconfigs',
  abbr: 'NMSC',
  namespaced: true,
  kind: 'NMStateConfig',
  labelPlural: 'NMStateConfigs',
  apiGroup: 'agent-install.openshift.io',
};

export const AgentMachineModel: K8sModel = {
  label: 'AgentMachine',
  apiVersion: 'v1beta1',
  plural: 'agentmachines',
  abbr: 'AM',
  namespaced: true,
  kind: 'AgentMachine',
  labelPlural: 'AgentMachines',
  apiGroup: 'capi-provider.agent-install.openshift.io',
};

export const AgentClusterInstallModel: K8sModel = {
  label: 'AgentClusterInstall',
  apiVersion: 'v1beta1',
  plural: 'agentclusterinstalls',
  abbr: 'ACI',
  namespaced: true,
  kind: 'AgentClusterInstall',
  labelPlural: 'AgentClusterInstalls',
  apiGroup: 'extensions.hive.openshift.io',
};

export const ManagedClusterModel: K8sModel = {
  label: 'ManagedCluster',
  apiVersion: 'v1',
  plural: 'managedclusters',
  abbr: 'MC',
  namespaced: false,
  kind: 'ManagedCluster',
  labelPlural: 'ManagedClusters',
  apiGroup: 'cluster.open-cluster-management.io',
};

export const KlusterletAddonConfigModel: K8sModel = {
  label: 'KlusterletAddonConfig',
  apiVersion: 'v1',
  plural: 'klusterletaddonconfigs',
  abbr: 'KAC',
  namespaced: true,
  kind: 'KlusterletAddonConfig',
  labelPlural: 'KlusterletAddonConfigs',
  apiGroup: 'agent.open-cluster-management.io',
};
