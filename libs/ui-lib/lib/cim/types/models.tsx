import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

export const AgentClusterInstallModel: K8sModel = {
  kind: 'AgentClusterInstall',
  label: 'AgentClusterInstall',
  labelPlural: 'AgentClusterInstalls',
  plural: 'agentclusterinstalls',
  apiVersion: 'v1beta1',
  apiGroup: 'extensions.hive.openshift.io',
  namespaced: true,
  abbr: 'ACI',
};

export const AgentServiceConfigModel: K8sModel = {
  kind: 'AgentServiceConfig',
  label: 'AgentServiceConfig',
  labelPlural: 'AgentServiceConfigs',
  plural: 'agentserviceconfigs',
  apiVersion: 'v1beta1',
  apiGroup: 'agent-install.openshift.io',
  namespaced: false,
  abbr: 'asc',
};

export const IngressControllerModel: K8sModel = {
  kind: 'IngressController',
  label: 'IngressController',
  labelPlural: 'IngressControllers',
  plural: 'ingresscontrollers',
  apiVersion: 'v1',
  apiGroup: 'operator.openshift.io',
  namespaced: true,
  abbr: 'ic',
};

export const RouteModel: K8sModel = {
  kind: 'Route',
  label: 'Route',
  labelPlural: 'Routes',
  plural: 'routes',
  apiVersion: 'v1',
  apiGroup: 'route.openshift.io',
  namespaced: true,
  abbr: 'rt',
};

export const ProvisioningModel: K8sModel = {
  kind: 'Provisioning',
  label: 'Provisioning',
  labelPlural: 'Provisionings',
  plural: 'provisionings',
  apiVersion: 'v1alpha1',
  apiGroup: 'metal3.io',
  namespaced: false,
  abbr: 'p',
};
