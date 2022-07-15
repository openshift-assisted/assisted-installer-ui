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
  const hostCountText =
    hostRole === 'master'
      ? t('ai:{{count}} control plane node', { count: hosts.length })
      : t('ai:{{count}} worker', { count: hosts.length });
  if (hosts.some((host) => ['cancelled', 'error'].includes(host.status))) {
    const failedHostsCount = hosts.filter((host) => host.status === 'error').length;
    return (
      <ClusterProgressItem icon={<ExclamationCircleIcon color={dangerColor.value} />}>
        <>
          {hostRoleText}
          <br />
          <small>
            {failedHostsCount}/{hostCountText} {t('ai:failed')}
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
          <small>
            {hostCountText} {t('ai:installed')}
          </small>
        </>
      </ClusterProgressItem>
    );
  }

  return (
    <ClusterProgressItem icon={<InProgressIcon />}>
      <>
        {hostRoleText}
        <br />
        <small>
          {t('ai:Installing')} {hostCountText}
        </small>
      </>
    </ClusterProgressItem>
  );
};
