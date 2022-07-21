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
import { clusterStatusLabels } from '../../config';
import './ClusterProgress.css';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks/use-translation-wrapper';

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
  t: TFunction,
) => {
  if (status === 'installed' || status === 'adding-hosts') {
    return t('ai:Installed on {{humanizedDataTime}}', {
      humanizedDataTime: getHumanizedDateTime(installCompletedAt),
    });
  }
  if (status === 'error') {
    return t('ai:Failed on {{humanizedDataTime}}', {
      humanizedDataTime: getHumanizedDateTime(installCompletedAt),
    });
  }
  if (status === 'cancelled') {
    return t('ai:Cancelled on {{humanizedDataTime}}', {
      humanizedDataTime: getHumanizedDateTime(installCompletedAt),
    });
  }

  return clusterStatusLabels(t)[status] || status;
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
  const { t } = useTranslation();
  return (
    <>
      <DetailList>
        <Flex direction={{ default: minimizedView ? 'row' : 'column' }}>
          <FlexItem>
            <DetailItem
              title={t('ai:Started on')}
              value={getHumanizedDateTime(cluster.installStartedAt)}
              idPrefix="cluster-progress-started-on"
            />
          </FlexItem>
          <FlexItem>
            <DetailItem
              title={t('ai:Status')}
              value={getInstallationStatus(cluster.status, cluster.installCompletedAt, t)}
              idPrefix="cluster-progress-status"
            />
          </FlexItem>
        </Flex>
      </DetailList>
      <RenderIf condition={!minimizedView}>
        <Progress
          value={totalPercentage || 0}
          label={`${totalPercentage || 0}%`}
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
