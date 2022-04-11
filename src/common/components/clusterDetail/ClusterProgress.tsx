import React from 'react';
import {
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
} from '@patternfly/react-core';
import { Cluster } from '../../api/types';
import { DetailItem, DetailList, getHumanizedDateTime, RenderIf } from '../ui';
import { CLUSTER_STATUS_LABELS } from '../../config';
import './ClusterProgress.css';

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
  totalPercentage?: number;
};

const ClusterProgress = ({
  cluster,
  minimizedView = false,
  totalPercentage,
}: ClusterProgressProps) => {
  const { status } = cluster;

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
      </RenderIf>
    </>
  );
};

export default ClusterProgress;
