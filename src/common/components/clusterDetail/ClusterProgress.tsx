import React from 'react';
import {
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Cluster, Host, HostRole, MonitoredOperator } from '../../api/types';
import { getEnabledHosts } from '../hosts/utils';
import { DetailItem, DetailList, getHumanizedDateTime, RenderIf } from '../ui';
import { CLUSTER_STATUS_LABELS } from '../../config';
import OperatorsProgressItem from './OperatorsProgressItem';
import { getOlmOperators } from './utils';
import { ProgressBarTexts } from './ProgressBarTexts';
import { FinalizingProgress, getFinalizingStatus } from './FinalizingProgress';
import './ClusterProgress.css';
import { EventListFetchProps } from '../../types';
import {
  HostInstallationWarning,
  HostsInstallationFailed,
  HostsInstallationSuccess,
} from './ProgressBarAlerts';

const getProgressVariant = (status: Cluster['status']) => {
  switch (status) {
    case 'cancelled':
    case 'error':
      return ProgressVariant.danger;
    case 'installed':
    case 'adding-hosts':
      return ProgressVariant.success;
    default:
      return undefined;
  }
};

const getMeasureLocation = (status: Cluster['status']) =>
  ['installed', 'adding-hosts'].includes(status)
    ? ProgressMeasureLocation.none
    : ProgressMeasureLocation.top;

const getInstallationStatus = (
  status: Cluster['status'],
  installCompletedAt: Cluster['installCompletedAt'],
) => {
  if (status === 'installed' || status === 'adding-hosts') {
    return `Installed on ${getHumanizedDateTime(installCompletedAt)}`;
  }
  if (status === 'error') {
    return `Failed on ${getHumanizedDateTime(installCompletedAt)}`;
  }
  if (status === 'cancelled') {
    return `Cancelled on ${getHumanizedDateTime(installCompletedAt)}`;
  }

  return CLUSTER_STATUS_LABELS[status] || status;
};

type ClusterProgressProps = {
  cluster: Cluster;
  minimizedView?: boolean;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  totalPercentage: number;
  fallbackEventsURL?: string;
  consoleUrl?: string;
};

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

const clusterProgressAlerts = (
  hosts: Host[],
  cluster: Cluster,
  olmOperators: MonitoredOperator[],
  consoleUrl?: string,
): React.ReactElement => {
  const [totalMasters, failedMasters, pendingUserActionMasters] = hostsStatus(hosts, 'master');
  const [totalWorkers, failedWorkers, pendingUserActionWorkers] = hostsStatus(hosts, 'worker');
  const failedOperators = olmOperatorsStatus(olmOperators);
  if (['error', 'cancelled'].includes(cluster.status)) {
    return (
      <Stack>
        <RenderIf condition={getFinalizingStatus(cluster)[1] === 'failed'}>
          <StackItem>
            <HostsInstallationFailed
              cluster={cluster}
              totalHosts={totalMasters}
              failedHosts={failedMasters}
              initializationFailed
              title={'Cluster initialization failed'}
            />
          </StackItem>
        </RenderIf>
        <RenderIf condition={totalWorkers - failedWorkers == 1}>
          <StackItem>
            <HostsInstallationFailed
              cluster={cluster}
              totalHosts={totalMasters}
              failedHosts={failedMasters}
              hostsType={'worker'}
              initializationFailed={false}
              title={'Critical number of workers were not installed'}
            />
          </StackItem>
        </RenderIf>
        <RenderIf condition={failedMasters > 0}>
          <StackItem>
            <HostsInstallationFailed
              cluster={cluster}
              totalHosts={totalMasters}
              failedHosts={failedMasters}
              hostsType={'master'}
              initializationFailed={false}
              title={'Control plane was not installed'}
            />
          </StackItem>
        </RenderIf>
      </Stack>
    );
  } else {
    return (
      <Stack>
        <RenderIf condition={cluster.status === 'installed'}>
          <HostsInstallationSuccess consoleUrl={consoleUrl} />
        </RenderIf>
        <RenderIf condition={failedWorkers > 0}>
          <StackItem>
            <HostInstallationWarning
              cluster={cluster}
              totalHosts={totalWorkers}
              failedHosts={failedWorkers}
              title={'Some workers were failed to installed'}
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
              title={'Some operators were failed to installed'}
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

const ClusterProgress = ({
  cluster,
  minimizedView = false,
  totalPercentage,
  onFetchEvents,
  fallbackEventsURL,
  consoleUrl,
}: ClusterProgressProps) => {
  const { status, monitoredOperators = [] } = cluster;
  const enabledHosts = getEnabledHosts(cluster.hosts);
  const isWorkersPresent = enabledHosts && enabledHosts.some((host) => host.role === 'worker');
  const olmOperators = getOlmOperators(monitoredOperators);

  return (
    <>
      <DetailList>
        <Flex direction={{ default: minimizedView ? 'row' : 'column' }}>
          <FlexItem>
            <DetailItem
              title="Started on"
              value={getHumanizedDateTime(cluster.installStartedAt)}
              idPrefix="cluster-progress-started-on"
            />
          </FlexItem>
          <FlexItem>
            <DetailItem
              title="Status"
              value={getInstallationStatus(cluster.status, cluster.installCompletedAt)}
              idPrefix="cluster-progress-status"
            />
          </FlexItem>
        </Flex>
      </DetailList>
      <RenderIf condition={!minimizedView}>
        <Progress
          value={totalPercentage}
          label={`${totalPercentage}%`}
          title=" "
          measureLocation={getMeasureLocation(status)}
          variant={getProgressVariant(status)}
          className="cluster-progress-bar"
        />
        <Flex className="pf-u-mt-md">
          <FlexItem spacer={{ default: 'spacer4xl' }}>
            <ProgressBarTexts hosts={enabledHosts} hostRole="master" />
          </FlexItem>
          <RenderIf condition={isWorkersPresent}>
            <FlexItem spacer={{ default: 'spacer4xl' }}>
              <ProgressBarTexts hosts={enabledHosts} hostRole="worker" />
            </FlexItem>
          </RenderIf>
          <FlexItem spacer={{ default: 'spacer4xl' }}>
            <FinalizingProgress
              cluster={cluster}
              onFetchEvents={onFetchEvents}
              fallbackEventsURL={fallbackEventsURL}
            />
          </FlexItem>
          <RenderIf condition={olmOperators.length > 0}>
            <FlexItem>
              <OperatorsProgressItem operators={olmOperators} />
            </FlexItem>
          </RenderIf>
        </Flex>
        {clusterProgressAlerts(enabledHosts, cluster, olmOperators, consoleUrl)}
      </RenderIf>
    </>
  );
};

export default ClusterProgress;
