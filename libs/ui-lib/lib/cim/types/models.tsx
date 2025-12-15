import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

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
