import { Host, Cluster } from '../../api/types';

export const canEnable = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['insufficient', 'ready'].includes(clusterStatus) && ['disabled'].includes(status);

export const canDisable = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['insufficient', 'ready'].includes(clusterStatus) &&
  ['discovering', 'disconnected', 'known', 'insufficient', 'pending-for-input'].includes(status);

export const canDelete = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['insufficient', 'ready', 'pending-for-input'].includes(clusterStatus) &&
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
  ['insufficient', 'ready'].includes(clusterStatus) &&
  [
    'discovering',
    'known',
    'disconnected',
    'disabled',
    'insufficient',
    'pending-for-input',
  ].includes(status);

export const canDownloadKubeconfig = (clusterStatus: Cluster['status']) =>
  ['installing', 'finalizing', 'error', 'installed'].includes(clusterStatus);

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
