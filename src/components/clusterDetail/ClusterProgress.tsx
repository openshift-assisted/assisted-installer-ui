import React from 'react';
import { Cluster, Host } from '../../api/types';
import { Progress, ProgressVariant, ProgressMeasureLocation } from '@patternfly/react-core';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';
import { getHostInstallationSteps } from '../hosts/HostStatus';

const getProgressVariant = (status: Cluster['status']) => {
  switch (status) {
    case 'error':
      return ProgressVariant.danger;
    case 'installed':
      return ProgressVariant.success;
    default:
      return undefined;
  }
};

const getMeasureLocation = (status: Cluster['status']) =>
  status === 'installed' ? ProgressMeasureLocation.none : ProgressMeasureLocation.top;

const getProgressLabel = (cluster: Cluster, progress: number): string => {
  const { status, statusInfo } = cluster;
  if (['error'].includes(status)) {
    return `${progress}%`;
  }
  return `${statusInfo}: ${progress}%`;
};

const getProgressPercent = (hosts: Host[] = []) => {
  const accountedHosts = hosts.filter((host) => !['disabled'].includes(host.status));
  const totalSteps = accountedHosts.reduce(
    (steps, host) => steps + getHostInstallationSteps(host.role, host.bootstrap).length,
    0,
  );
  const completedSteps = accountedHosts.reduce((steps, host) => {
    const hostInstallationSteps = getHostInstallationSteps(host.role, host.bootstrap);
    if (['installed', 'error'].includes(host.status)) {
      return steps + hostInstallationSteps.length;
    } else {
      return steps + (hostInstallationSteps.indexOf(host.statusInfo) + 1);
    }
  }, 0);
  return (completedSteps / totalSteps) * 100;
};

type ClusterProgressProps = {
  cluster: Cluster;
};

const ClusterProgress: React.FC<ClusterProgressProps> = ({ cluster }) => {
  const { status, hosts } = cluster;
  const progress = React.useMemo(
    () => (status === 'installed' ? 100 : Math.round(getProgressPercent(hosts))),
    [status, hosts],
  );
  const label = getProgressLabel(cluster, progress);

  return (
    <Progress
      value={progress}
      title={CLUSTER_STATUS_LABELS[status]}
      label={label}
      measureLocation={getMeasureLocation(status)}
      variant={getProgressVariant(status)}
    />
  );
};

export default ClusterProgress;
