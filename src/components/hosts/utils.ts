import { saveAs } from 'file-saver';
import { Host, Cluster, Presigned } from '../../api/types';
import { HOST_ROLES, TIME_ZERO } from '../../config';
import {
  getHostLogsDownloadUrl,
  ocmClient,
  handleApiError,
  getErrorMessage,
  getPresignedFileUrl,
} from '../../api';
import { AlertsContextType } from '../AlertsContextProvider';

export const canEnable = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready'].includes(clusterStatus) &&
  ['disabled'].includes(status);

export const canDisable = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready'].includes(clusterStatus) &&
  ['discovering', 'disconnected', 'known', 'insufficient', 'pending-for-input'].includes(status);

export const canDelete = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready'].includes(clusterStatus) &&
  [
    'discovering',
    'known',
    'disconnected',
    'disabled',
    'insufficient',
    'resetting',
    'resetting-pending-user-input',
    'pending-for-input',
  ].includes(status);

export const canEditRole = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready'].includes(clusterStatus) &&
  [
    'discovering',
    'known',
    'disconnected',
    'disabled',
    'insufficient',
    'pending-for-input',
  ].includes(status);

export const canEditHost = canEditRole;

export const canDownloadKubeconfig = (clusterStatus: Cluster['status']) =>
  ['installing', 'finalizing', 'error', 'cancelled', 'installed'].includes(clusterStatus);

export const getHostProgressStages = (host: Host) => host.progressStages || [];

export const getHostProgress = (host: Host) =>
  host.progress || { currentStage: 'Preparing installation', progressInfo: undefined };

export const getHostProgressStageNumber = (host: Host) => {
  const stages = getHostProgressStages(host);
  const progress = getHostProgress(host);
  if (progress) {
    const currentStage = progress.currentStage;
    return stages.findIndex((s) => currentStage.match(s)) + 1;
  }
  return 0;
};

export const canHostnameBeChanged = (hostStatus: Host['status']) =>
  ['discovering', 'known', 'disconnected', 'insufficient', 'pending-for-input'].includes(
    hostStatus,
  );

export const getHostRole = (host: Host): string =>
  `${HOST_ROLES.find((role) => role.value === host.role)?.label || HOST_ROLES[0].label}${
    host.bootstrap ? ' (bootstrap)' : ''
  }`;

export const canDownloadHostLogs = (host: Host) =>
  !!host.logsCollectedAt && host.logsCollectedAt != TIME_ZERO;

export const canDownloadClusterLogs = (cluster: Cluster) =>
  !!(cluster.hosts || []).find((host) => canDownloadHostLogs(host));

export const downloadHostInstallationLogs = async (
  addAlert: AlertsContextType['addAlert'],
  host: Host,
) => {
  if (ocmClient) {
    try {
      const { data } = await getPresignedFileUrl(host.clusterId || '', 'logs', host.id);
      // TODO(mlibra): Setting of filename here is workaround till https://issues.redhat.com/browse/MGMT-2128 is fixed.The Content-Disposition header should be set.
      const filename = `log_host_${host.id}_${host.requestedHostname}.tgz`;
      saveAs(data.url, filename);
    } catch (e) {
      handleApiError<Presigned>(e, async (e) => {
        addAlert({ title: 'Could not download host logs.', message: getErrorMessage(e) });
      });
    }
  } else {
    saveAs(getHostLogsDownloadUrl(host.id, host.clusterId));
  }
};
