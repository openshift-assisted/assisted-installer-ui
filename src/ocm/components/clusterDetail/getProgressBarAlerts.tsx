import { Cluster, Host, HostRole, MonitoredOperator, RenderIf } from '../../../common';
import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  HostsInstallationFailed,
  HostInstallationWarning,
  HostsInstallationSuccess,
} from './ProgressBarAlerts';

const hostsStatus = (hosts: Host[], hostRole: HostRole) => {
  const totalHosts = hosts.filter((host) => host.role && host.role === hostRole);
  const failedHosts = totalHosts.filter((host) => ['cancelled', 'error'].includes(host.status));
  const pendingUserActionHosts = totalHosts.filter((host) =>
    ['installing-pending-user-action'].includes(host.status),
  );
  return [totalHosts.length, failedHosts.length, pendingUserActionHosts.length];
};

const olmOperatorsStatus = (olmOperators: MonitoredOperator[]) => {
  return olmOperators.filter((operator) => operator.status && operator.status === 'failed');
};

export const getClusterProgressAlerts = (
  hosts: Host[],
  cluster: Cluster,
  olmOperators: MonitoredOperator[],
): React.ReactElement => {
  const [totalMasters, failedMasters, pendingUserActionMasters] = hostsStatus(hosts, 'master');
  const [totalWorkers, failedWorkers, pendingUserActionWorkers] = hostsStatus(hosts, 'worker');
  const failedOperators = olmOperatorsStatus(olmOperators);
  if (['error', 'cancelled'].includes(cluster.status)) {
    return (
      <Stack>
        <StackItem>
          <HostsInstallationFailed
            cluster={cluster}
            totalHosts={totalMasters}
            failedHosts={failedMasters}
            isCriticalNumberOfWorkersFailed={failedWorkers === 1}
          />
        </StackItem>
      </Stack>
    );
  } else {
    return (
      <Stack hasGutter>
        <RenderIf condition={cluster.status === 'installed'}>
          <StackItem>
            <HostsInstallationSuccess />
          </StackItem>
        </RenderIf>
        <RenderIf condition={failedWorkers > 0}>
          <StackItem>
            <HostInstallationWarning
              cluster={cluster}
              totalHosts={totalWorkers}
              failedHosts={failedWorkers}
              title={`Could not install ${failedWorkers} worker hosts`}
              hostsType={'worker'}
              message={'failed to install.'}
            />
          </StackItem>
        </RenderIf>
        <RenderIf condition={failedOperators.length > 0}>
          <StackItem>
            <HostInstallationWarning
              cluster={cluster}
              totalHosts={totalMasters}
              failedHosts={failedMasters}
              title={'Some operators failed to install'}
              failedOperators={failedOperators}
              message={'failed to install.'}
            />
          </StackItem>
        </RenderIf>
        <RenderIf condition={pendingUserActionMasters > 0}>
          <StackItem>
            <HostInstallationWarning
              cluster={cluster}
              totalHosts={totalMasters}
              failedHosts={failedMasters}
              title={'Some hosts are pending user action'}
              failedOperators={failedOperators}
              message={'are pending user action.'}
            />
          </StackItem>
        </RenderIf>
        <RenderIf condition={pendingUserActionWorkers > 0}>
          <StackItem>
            <HostInstallationWarning
              cluster={cluster}
              totalHosts={totalWorkers}
              failedHosts={failedWorkers}
              title={'Some hosts are pending user action'}
              message={'are pending user action.'}
            />
          </StackItem>
        </RenderIf>
      </Stack>
    );
  }
};
