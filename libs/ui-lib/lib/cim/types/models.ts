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
