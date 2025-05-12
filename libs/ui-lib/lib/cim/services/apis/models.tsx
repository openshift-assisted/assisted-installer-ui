import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

export const MachineConfigModel: K8sModel = {
  abbr: 'MC',
  kind: 'MachineConfig',
  label: 'MachineConfig',
  labelPlural: 'MachineConfigs',
  plural: 'machineconfigs',
  apiVersion: 'v1',
  apiGroup: 'machineconfiguration.openshift.io',
  namespaced: false,
  id: 'machineconfig',
};

export const AgentClusterInstallModel: K8sModel = {
  abbr: 'aci',
  kind: 'AgentClusterInstall',
  label: 'AgentClusterInstall',
  labelPlural: 'AgentClusterInstalls',
  plural: 'agentclusterinstalls',
  apiVersion: 'v1beta1',
  apiGroup: 'extensions.hive.openshift.io',
  namespaced: true,
  id: 'agentclusterinstall',
};
