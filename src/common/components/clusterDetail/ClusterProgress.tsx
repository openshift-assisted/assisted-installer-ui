import React from 'react';
import { pluralize } from 'humanize-plus';
import {
  Progress,
  ProgressVariant,
  ProgressMeasureLocation,
  Flex,
  FlexItem,
  Popover,
  Button,
  ButtonVariant,
  TextContent,
  Text,
} from '@patternfly/react-core';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  InProgressIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import { Cluster, Host, HostRole, MonitoredOperatorsList } from '../../api';
import { getEnabledHosts, getHostProgressStageNumber, getHostProgressStages } from '../hosts';
import { DetailItem, DetailList, getHumanizedDateTime, RenderIf } from '../ui';
import { CLUSTER_STATUS_LABELS } from '../../config';
import OperatorsProgressItem from './OperatorsProgressItem';
import { EventsModal } from '../ui/eventsModal';
import { getOlmOperators } from './utils';

import './ClusterProgress.css';
import { EventListFetchProps } from '../../types';

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

const getProgressLabel = (
  status: Cluster['status'],
  statusInfo: Cluster['statusInfo'],
  progressPercent: number,
): string => {
  if (status === 'preparing-for-installation') {
    return statusInfo;
  }

  return `${progressPercent}%`;
};

const getHostsProgressPercent = (hosts: Host[] = []) => {
  const accountedHosts = getEnabledHosts(hosts);
  const totalSteps = accountedHosts.reduce(
    (steps, host) => steps + getHostProgressStages(host).length,
    0,
  );
  const completedSteps = accountedHosts.reduce(
    (steps, host) => steps + getHostProgressStageNumber(host),
    0,
  );
  return totalSteps ? (completedSteps / totalSteps) * 100 : 100;
};

const getOperatorsProgressPercent = (monitoredOperators: MonitoredOperatorsList) => {
  const completeOperators = monitoredOperators.filter(
    (operator) =>
      (operator.operatorType === 'builtin' && operator.status === 'available') ||
      (operator.operatorType === 'olm' && ['available', 'failed'].includes(operator.status || '')),
  );

  return monitoredOperators.length
    ? (completeOperators.length / monitoredOperators.length) * 100
    : 100;
};

const getInstallationStatus = (
  status: Cluster['status'],
  installCompletedAt: Cluster['installCompletedAt'],
) => {
  if (status === 'installed') {
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

const getHostStatusIcon = (hosts: Host[]): React.ReactElement => {
  if (hosts.some((host) => ['cancelled', 'error'].includes(host.status))) {
    return <ExclamationCircleIcon color={dangerColor.value} />;
  }

  if (hosts.every((host) => host.status === 'installed')) {
    return <CheckCircleIcon color={okColor.value} />;
  }

  return <InProgressIcon />;
};

type HostProgressProps = {
  hosts: Host[];
  hostRole: HostRole;
};

const HostProgress: React.FC<HostProgressProps> = ({ hosts, hostRole }) => {
  const filteredHosts = hosts.filter((host) => host.role && hostRole === host.role);
  const icon = getHostStatusIcon(filteredHosts);
  const failedHostsCount = filteredHosts.filter((host) => host.status === 'error').length;
  const hostCountText = (hostType: 'worker' | 'master') =>
    failedHostsCount === 0
      ? `${filteredHosts.length} ${pluralize(filteredHosts.length, hostType)}`
      : `${failedHostsCount}/${filteredHosts.length} ${pluralize(failedHostsCount, hostType)}`;

  const text =
    hostRole === 'master'
      ? `Control Plane (${hostCountText('master')})`
      : `${hostCountText('worker')}`;

  return (
    <Flex className="pf-u-mr-3xl">
      <FlexItem>{icon}</FlexItem>
      <FlexItem>{text}</FlexItem>
    </Flex>
  );
};

const getFinalizingStatusIcon = (cluster: Cluster) => {
  let statusIcon;
  const { monitoredOperators = [] } = cluster;
  const areAllBuiltInOperatorsAvailable = monitoredOperators
    .filter((op) => op.operatorType === 'builtin')
    ?.every((op) => op.status === 'available');
  if (areAllBuiltInOperatorsAvailable) {
    statusIcon = <CheckCircleIcon color={okColor.value} />;
  } else {
    switch (cluster.status) {
      case 'finalizing':
        statusIcon = <InProgressIcon />;
        break;
      case 'error':
      case 'cancelled':
        statusIcon = <ExclamationCircleIcon color={dangerColor.value} />;
        break;
      default:
        statusIcon = <PendingIcon />;
    }
  }

  return statusIcon;
};

type FinalizingProgressProps = {
  cluster: Cluster;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
};

const FinalizingProgress: React.FC<FinalizingProgressProps> = ({ cluster, onFetchEvents }) => {
  const { status } = cluster;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <EventsModal
        title="Cluster Events"
        isOpen={isModalOpen}
        onClose={closeModal}
        hostId={undefined}
        cluster={cluster}
        entityKind="cluster"
        onFetchEvents={onFetchEvents}
      />
      <Flex className="pf-u-mr-3xl">
        <FlexItem>{getFinalizingStatusIcon(cluster)}</FlexItem>
        <FlexItem>
          {status === 'finalizing' ? (
            <Popover
              zIndex={300} // set the zIndex below Cluster Events Modal
              headerContent={<>Initialization</>}
              bodyContent={
                <TextContent>
                  <Text>
                    Initializing, this may take a while. For more information see Cluster Events.
                  </Text>
                </TextContent>
              }
              footerContent={
                <Button variant={ButtonVariant.link} isInline onClick={() => setIsModalOpen(true)}>
                  View Cluster Events
                </Button>
              }
            >
              <Button variant={ButtonVariant.link} isInline>
                Initialization
              </Button>
            </Popover>
          ) : (
            'Initialization'
          )}
        </FlexItem>
      </Flex>
    </>
  );
};

type ClusterProgressProps = {
  cluster: Cluster;
  minimizedView?: boolean;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
};

const ClusterProgress = ({
  cluster,
  minimizedView = false,
  onFetchEvents,
}: ClusterProgressProps) => {
  const { status, monitoredOperators = [] } = cluster;
  const hostsProgressPercent = React.useMemo(() => getHostsProgressPercent(cluster.hosts), [
    cluster.hosts,
  ]);
  const operatorsProgressPercent = React.useMemo(
    () => getOperatorsProgressPercent(monitoredOperators),
    [monitoredOperators],
  );
  const progressValue = Math.round(hostsProgressPercent * 0.75 + operatorsProgressPercent * 0.25);
  const label = getProgressLabel(cluster.status, cluster.statusInfo, progressValue);
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
          value={progressValue}
          label={label}
          title=" "
          measureLocation={getMeasureLocation(status)}
          variant={getProgressVariant(status)}
          className="cluster-progress-bar"
        />
        <Flex className="pf-u-mt-md" display={{ default: 'inlineFlex' }}>
          <FlexItem>
            <HostProgress hosts={enabledHosts} hostRole="master" />
          </FlexItem>

          <RenderIf condition={isWorkersPresent}>
            <FlexItem>
              <HostProgress hosts={enabledHosts} hostRole="worker" />
            </FlexItem>
          </RenderIf>

          <FlexItem>
            <FinalizingProgress cluster={cluster} onFetchEvents={onFetchEvents} />
          </FlexItem>

          <RenderIf condition={olmOperators.length > 0}>
            <FlexItem>
              <OperatorsProgressItem operators={olmOperators} />
            </FlexItem>
          </RenderIf>
        </Flex>
      </RenderIf>
    </>
  );
};

export default ClusterProgress;
