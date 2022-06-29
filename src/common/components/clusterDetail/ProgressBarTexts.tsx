import React from 'react';
import { Host, HostRole } from '../../api/types';
import { pluralize } from 'humanize-plus';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/esm/global_success_color_100';
import ClusterProgressItem from './ClusterProgressItem';

type HostProgressProps = {
  hosts: Host[];
  hostRole: HostRole;
};

export const ProgressBarTexts = ({ hosts, hostRole }: HostProgressProps) => {
  const filteredHosts = hosts.filter((host) => host.role && hostRole === host.role);
  const failedHostsCount = filteredHosts.filter((host) => host.status === 'error').length;
  const hostCountText = (hostRole: HostRole) =>
    failedHostsCount === 0
      ? `${filteredHosts.length} ${pluralize(
          filteredHosts.length,
          hostRole === 'master' ? 'control plane node' : 'worker',
        )}`
      : `${failedHostsCount}/${filteredHosts.length} ${pluralize(
          filteredHosts.length,
          hostRole === 'master' ? 'control plane node' : 'worker',
        )}`;

  const getHostName = (hostRole: HostRole): string => {
    if (hostRole === 'master') {
      return 'Control Plane';
    }
    return 'Workers';
  };

  if (filteredHosts.some((host) => ['cancelled', 'error'].includes(host.status))) {
    return (
      <ClusterProgressItem icon={<ExclamationCircleIcon color={dangerColor.value} />}>
        <>
          {getHostName(hostRole)}
          <br />
          <small>{hostCountText(hostRole)} failed</small>
        </>
      </ClusterProgressItem>
    );
  }

  if (filteredHosts.every((host) => host.status === 'installed')) {
    return (
      <ClusterProgressItem icon={<CheckCircleIcon color={okColor.value} />}>
        <>
          {getHostName(hostRole)}
          <br />
          <small>{hostCountText(hostRole)} installed</small>
        </>
      </ClusterProgressItem>
    );
  }

  return (
    <ClusterProgressItem icon={<InProgressIcon />}>
      <>
        {getHostName(hostRole)}
        <br />
        <small>Installing {hostCountText(hostRole)}</small>
      </>
    </ClusterProgressItem>
  );
};
