import { Host, Cluster, HostProgressReport } from '../../api/types';
import { stringToJSON } from '../../api/utils';

export const canEditRole = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['insufficient', 'ready'].includes(clusterStatus) &&
  ['discovering', 'known', 'disconnected', 'disabled', 'insufficient'].includes(status);

export const getHostProgressStages = (host: Host) => {
  const progress = stringToJSON<HostProgressReport>(host.progress) || {};
  return progress?.stages || [];
};

export const getHostProgress = (host: Host) => {
  const progress = stringToJSON<HostProgressReport>(host.progress) || {};
  return (
    progress?.currentProgress || { currentStage: 'Preparing installation', progressInfo: undefined }
  );
};

export const getHostProgressStageNumber = (host: Host) => {
  const stages = getHostProgressStages(host);
  const progress = getHostProgress(host);
  if (progress) {
    const currentStage = progress.currentStage;
    return stages.findIndex((s) => currentStage.match(s)) + 1;
  }
  return 0;
};
