import React from 'react';
import { Host, HostRole } from '../../api/types';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/esm/global_success_color_100';
import ClusterProgressItem from './ClusterProgressItem';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type HostProgressProps = {
  hosts: Host[];
  hostRole: HostRole;
};

export const ProgressBarTexts = ({ hosts, hostRole }: HostProgressProps) => {
  const { t } = useTranslation();

  const hostRoleText =
    hostRole === 'master'
      ? t('ai:Control Plane', { count: hosts.length })
      : t('ai:Worker', { count: hosts.length });

  if (hosts.some((host) => ['cancelled', 'error'].includes(host.status))) {
    const failedHostsCount = hosts.filter((host) => host.status === 'error').length;
    return (
      <ClusterProgressItem icon={<ExclamationCircleIcon color={dangerColor.value} />}>
        <>
          {hostRoleText}
          <br />
          <small>
            {failedHostsCount}/
            {hostRole === 'master'
              ? t('ai:{{count}} control plane node failed', { count: hosts.length })
              : t('ai:{{count}} worker failed', { count: hosts.length })}
          </small>
        </>
      </ClusterProgressItem>
    );
  }

  const installedHosts = hosts.filter((host) =>
    ['installed', 'added-to-existing-cluster'].includes(host.status),
  );
  const beingInstalledHosts = hosts.filter((host) =>
    [
      'preparing-for-installation',
      'preparing-successful',
      'pending-for-input',
      'installing',
      'installing-in-progress',
      'installing-pending-user-action',
      'resetting-pending-user-action',
      'resetting',
    ].includes(host.status),
  );
  if (beingInstalledHosts.length > 0) {
    return (
      <ClusterProgressItem icon={<InProgressIcon />}>
        <>
          {hostRoleText}
          <br />
          <small>
            {hostRole === 'master'
              ? t('ai:Installing {{count}} control plane node', {
                  count: beingInstalledHosts.length,
                })
              : t('ai:Installing {{count}} worker', { count: beingInstalledHosts.length })}
          </small>
        </>
      </ClusterProgressItem>
    );
  }

  return (
    <ClusterProgressItem icon={<CheckCircleIcon color={okColor.value} />}>
      <>
        {hostRoleText}
        <br />
        <small>
          {hostRole === 'master'
            ? t('ai:{{count}} control plane node installed', { count: installedHosts.length })
            : t('ai:{{count}} worker installed', { count: installedHosts.length })}
        </small>
      </>
    </ClusterProgressItem>
  );
};
