import { saveAs } from 'file-saver';
import {
  ocmClient,
  getPresignedFileUrl,
  handleApiError,
  getErrorMessage,
  getClusterLogsDownloadUrl,
  stringToJSON,
} from '../../api';
import { Cluster, ClusterStatusEnum, Host, Presigned } from '../../api/types';
import { AlertsContextType } from '../AlertsContextProvider';
import { getMasterCount, getWorkerCount } from '../hosts/utils';

export const getCamelCasedClusterObject = (cluster: Cluster): Cluster => {
  if (cluster.statusInfo) {
    return cluster;
  }

  return stringToJSON<Cluster>(JSON.stringify(cluster)) as Cluster;
};

export const downloadClusterInstallationLogs = async (
  addAlert: AlertsContextType['addAlert'],
  clusterId: string,
) => {
  if (ocmClient) {
    try {
      const { data } = await getPresignedFileUrl({
        clusterId,
        fileName: 'logs',
        hostId: undefined,
        logsType: 'all',
      });
      saveAs(data.url);
    } catch (e) {
      handleApiError<Presigned>(e, async (e) => {
        addAlert({
          title: 'Could not download cluster installation logs.',
          message: getErrorMessage(e),
        });
      });
    }
  } else {
    saveAs(getClusterLogsDownloadUrl(clusterId));
  }
};

/*
  Return Cluster CPU count.
  Return N/A when the cluster is not installed
*/

export const getClustervCPUCount = (cluster: Cluster): string => {
  if (!cluster.hosts || cluster.status !== ClusterStatusEnum.INSTALLED) {
    return 'N/A';
  }

  const masterCount = getMasterCount(cluster.hosts);
  const workerCount = getWorkerCount(cluster.hosts);

  // Cluster contain only master hosts
  const countMastersOnly = masterCount >= 3 && workerCount === 0;

  // Cluster contain master and worker hosts
  const countWorkersOnly = masterCount >= 3 && workerCount >= 2;

  const cpuCount = cluster.hosts.reduce((acc, host: Host) => {
    if (!host.inventory) {
      return acc;
    }
    if (
      (host.role === 'worker' && countWorkersOnly) ||
      (host.role === 'master' && countMastersOnly)
    ) {
      const hostInventory = JSON.parse(host.inventory as string);
      return (acc += hostInventory.cpu.count);
    }
  }, 0);

  return `${cpuCount} vCPU`;
};

export const getClusterMemoryAmount = (cluster: Cluster): number => {
  if (!cluster.hosts || cluster.status !== ClusterStatusEnum.INSTALLED) {
    return 0;
  }

  const masterCount = getMasterCount(cluster.hosts);
  const workerCount = getWorkerCount(cluster.hosts);

  // Cluster contain only master hosts
  const countMastersOnly = masterCount >= 3 && workerCount === 0;

  // Cluster contain master and worker hosts
  const countWorkersOnly = masterCount >= 3 && workerCount >= 2;

  return cluster.hosts.reduce((acc, host: Host) => {
    if (!host.inventory) {
      return acc;
    }
    if (
      (host.role === 'worker' && countWorkersOnly) ||
      (host.role === 'master' && countMastersOnly)
    ) {
      const hostInventory = JSON.parse(host.inventory as string);
      return (acc += hostInventory.memory.physical_bytes);
    }
  }, 0);
};
