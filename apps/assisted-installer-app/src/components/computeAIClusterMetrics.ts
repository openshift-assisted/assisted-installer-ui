import {
  getClusterMemoryAmount,
  getClustervCPUCount,
  getMasterCount,
  getWorkerCount,
} from '@openshift-assisted/ui-lib/ocm';
import type { Cluster, Host } from '@openshift-assisted/types/assisted-installer-service';

type AIClusterMetrics = {
  masterCount: number;
  workerCount: number;
  memoryTotal: number;
  cpuTotal: number;
};

export const computeAIClusterMetrics = (aiCluster: Cluster): AIClusterMetrics => {
  const hosts: Host[] = aiCluster?.hosts ?? [];
  return {
    masterCount: getMasterCount(hosts),
    workerCount: getWorkerCount(hosts),
    memoryTotal: getClusterMemoryAmount(aiCluster),
    cpuTotal: getClustervCPUCount(aiCluster),
  };
};
