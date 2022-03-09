import React from 'react';
import {
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
} from '@patternfly/react-core';
import { Cluster } from '../../api/types';
import { getEnabledHosts } from '../hosts/utils';
import { DetailItem, DetailList, getHumanizedDateTime, RenderIf } from '../ui';
import { CLUSTER_STATUS_LABELS } from '../../config';
import OperatorsProgressItem from './OperatorsProgressItem';
import { getOlmOperators } from './utils';
import { ProgressBarTexts } from './ProgressBarTexts';
import { FinalizingProgress } from './FinalizingProgress';
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
};

const ClusterProgress = ({
  cluster,
  minimizedView = false,
  totalPercentage,
  onFetchEvents,
  fallbackEventsURL,
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
      </RenderIf>
    </>
  );
};

export default ClusterProgress;
