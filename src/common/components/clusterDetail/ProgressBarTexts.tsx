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
  const hostRoleText = pluralize(hosts.length, hostRole === 'master' ? 'Control Plane' : 'Worker');
  const hostCountText = `${hosts.length} ${pluralize(
    hosts.length,
    hostRole === 'master' ? 'control plane node' : 'worker',
  )}`;

  if (hosts.some((host) => ['cancelled', 'error'].includes(host.status))) {
    const failedHostsCount = hosts.filter((host) => host.status === 'error').length;
    return (
      <ClusterProgressItem icon={<ExclamationCircleIcon color={dangerColor.value} />}>
        <>
          {hostRoleText}
          <br />
          <small>
            {failedHostsCount}/{hostCountText} failed
          </small>
        </>
      </ClusterProgressItem>
    );
  }

  if (hosts.every((host) => host.status === 'installed')) {
    return (
      <ClusterProgressItem icon={<CheckCircleIcon color={okColor.value} />}>
        <>
          {hostRoleText}
          <br />
          <small>{hostCountText} installed</small>
        </>
      </ClusterProgressItem>
    );
  }

  return (
    <ClusterProgressItem icon={<InProgressIcon />}>
      <>
        {hostRoleText}
        <br />
        <small>Installing {hostCountText}</small>
      </>
    </ClusterProgressItem>
  );
};
