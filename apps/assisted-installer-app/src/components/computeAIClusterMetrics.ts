import {
  getClusterMemoryAmount,
  getClustervCPUCount,
  getMasterCount,
  getWorkerCount,
} from '@openshift-assisted/ui-lib/ocm';
import type { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const computeAIClusterMetrics = (aiCluster: Cluster) => {
  const hosts = aiCluster?.hosts ?? [];
  return {
    masterCount: getMasterCount(hosts),
    workerCount: getWorkerCount(hosts),
    memoryTotal: getClusterMemoryAmount(aiCluster),
    cpuTotal: getClustervCPUCount(aiCluster),
  };
};
