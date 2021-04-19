import React from 'react';
import { Cluster, Host, HostRole } from '../../api/types';
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
import { CLUSTER_STATUS_LABELS } from '../../config/constants';
import { getHostProgressStages, getHostProgressStageNumber, getEnabledHosts } from '../hosts/utils';
import { getHumanizedDateTime, DetailList, DetailItem } from '../ui';
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
import { EventsModal } from '../ui/eventsModal';
import OperatorsProgressItem from './OperatorsProgressItem';

import './ClusterProgress.css';

const getProgressVariant = (status: Cluster['status']) => {
  switch (status) {
    case 'cancelled':
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

const getProgressLabel = (cluster: Cluster, progressPercent: number): string => {
  const { status, statusInfo } = cluster;
  if (status === 'preparing-for-installation') {
    return statusInfo;
  }

  return `${progressPercent}%`;
};

const getProgressPercent = (hosts: Host[] = []) => {
  const accountedHosts = getEnabledHosts(hosts);
  const totalSteps = accountedHosts.reduce(
    (steps, host) => steps + getHostProgressStages(host).length,
    0,
  );
  const completedSteps = accountedHosts.reduce(
    (steps, host) => steps + getHostProgressStageNumber(host),
    0,
  );
  return (completedSteps / totalSteps) * 100;
};

const getInstallationStatus = (cluster: Cluster) => {
  const { status } = cluster;

  if (status === 'installed') {
    return `Installed on ${getHumanizedDateTime(cluster.installCompletedAt)}`;
  }
  if (status === 'error') {
    return `Failed on ${getHumanizedDateTime(cluster.installCompletedAt)}`;
  }
  if (status === 'cancelled') {
    return `Cancelled on ${getHumanizedDateTime(cluster.installCompletedAt)}`;
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
  const hostCountText =
    failedHostsCount === 0
      ? `${filteredHosts.length}`
      : `${failedHostsCount}/${filteredHosts.length}`;

  const text =
    hostRole === 'master' ? `Control Plane (${hostCountText} masters)` : `${hostCountText} workers`;

  return (
    <Flex className="pf-u-mr-3xl">
      <FlexItem>{icon}</FlexItem>
      <FlexItem>{text}</FlexItem>
    </Flex>
  );
};

const getFinalizingStatusIcon = (status: string) => {
  switch (status) {
    case 'installed':
      return <CheckCircleIcon color={okColor.value} />;
    case 'finalizing':
      return <InProgressIcon />;
    case 'error':
    case 'cancelled':
      return <ExclamationCircleIcon color={dangerColor.value} />;
    default:
      return <PendingIcon />;
  }
};

type FinalizingProgressProps = {
  cluster: Cluster;
};

const FinalizingProgress: React.FC<FinalizingProgressProps> = ({ cluster }) => {
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
      />
      <Flex className="pf-u-mr-3xl">
        <FlexItem>{getFinalizingStatusIcon(status)}</FlexItem>
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
};

const ClusterProgress: React.FC<ClusterProgressProps> = ({ cluster, minimizedView = false }) => {
  const { status, monitoredOperators = [] } = cluster;
  const hosts = getEnabledHosts(cluster.hosts);
  const progressPercent = React.useMemo(() => Math.round(getProgressPercent(hosts)), [hosts]);
  const label = getProgressLabel(cluster, progressPercent);
  const isWorkersPresent = hosts && hosts.some((host) => host.role === 'worker');

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
              value={getInstallationStatus(cluster)}
              idPrefix="cluster-progress-status"
            />
          </FlexItem>
        </Flex>
      </DetailList>
      {!minimizedView && (
        <>
          <Progress
            value={progressPercent}
            label={label}
            title=" "
            measureLocation={getMeasureLocation(status)}
            variant={getProgressVariant(status)}
            className="cluster-progress-bar"
          />
          <Flex className="pf-u-mt-md" display={{ default: 'inlineFlex' }}>
            <FlexItem>
              <HostProgress hosts={hosts} hostRole="master" />
            </FlexItem>
            {!!monitoredOperators.length && (
              <FlexItem>
                <OperatorsProgressItem operators={monitoredOperators} />
              </FlexItem>
            )}
            {isWorkersPresent && (
              <FlexItem>
                <HostProgress hosts={hosts} hostRole="worker" />
              </FlexItem>
            )}
            <FlexItem>
              <FinalizingProgress cluster={cluster} />
            </FlexItem>
          </Flex>
        </>
      )}
    </>
  );
};

export default ClusterProgress;
