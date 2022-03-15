import { Host, HostRole } from '../../api/types';
import React from 'react';
import { pluralize } from 'humanize-plus';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import { Stack, StackItem } from '@patternfly/react-core';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/esm/global_success_color_100';
import BorderedIcon from '../ui/BorderedIcon/BorderedIcon';

type HostProgressProps = {
  hosts: Host[];
  hostRole: HostRole;
};

export const ProgressBarTexts: React.FC<HostProgressProps> = ({ hosts, hostRole }) => {
  const filteredHosts = hosts.filter((host) => host.role && hostRole === host.role);
  const failedHostsCount = filteredHosts.filter((host) => host.status === 'error').length;
  const hostCountText = (hostRole: HostRole) =>
    failedHostsCount === 0
      ? `${filteredHosts.length} ${pluralize(
          filteredHosts.length,
          hostRole === 'master' ? 'control plane' : 'worker',
        )}`
      : `${failedHostsCount}/${filteredHosts.length} ${pluralize(
          filteredHosts.length,
          hostRole === 'master' ? 'control plane' : 'worker',
        )}`;
  const getHostName = (hostRole: HostRole): React.ReactElement => {
    if (hostRole == 'master') {
      return <StackItem>Control Plane</StackItem>;
    }
    return <StackItem> Workers</StackItem>;
  };

  if (filteredHosts.some((host) => ['cancelled', 'error'].includes(host.status))) {
    return (
      <>
        <Stack hasGutter>
          <StackItem>
            <BorderedIcon>
              <ExclamationCircleIcon color={dangerColor.value} />
            </BorderedIcon>
          </StackItem>
          <StackItem>
            {getHostName(hostRole)}
            {hostCountText(hostRole)} failed
          </StackItem>
        </Stack>
      </>
    );
  }

  if (filteredHosts.every((host) => host.status === 'installed')) {
    return (
      <>
        <Stack hasGutter>
          <StackItem>
            <BorderedIcon>
              <CheckCircleIcon color={okColor.value} />
            </BorderedIcon>
          </StackItem>
          <StackItem>
            {getHostName(hostRole)}
            {hostCountText(hostRole)} installed
          </StackItem>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <BorderedIcon>
            <InProgressIcon />
          </BorderedIcon>
        </StackItem>
        <StackItem>
          {getHostName(hostRole)}
          Installing {hostCountText(hostRole)}
        </StackItem>
      </Stack>
    </>
  );
};
