import React from 'react';
import { Popover, Button, ButtonVariant } from '@patternfly/react-core';
import {
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  WarningTriangleIcon,
  CheckCircleIcon,
  UnknownIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';
import { getHumanizedDateTime } from '../ui/utils';

type ClusterStatusProps = {
  cluster: Cluster;
};

const getStatusIcon = (status: Cluster['status']) => {
  if (status === 'insufficient') return <WarningTriangleIcon color={warningColor.value} />;
  if (status === 'ready') return <CheckCircleIcon color={okColor.value} />;
  if (status === 'installing') return <InProgressIcon />;
  if (status === 'error') return <ExclamationCircleIcon color={dangerColor.value} />;
  if (status === 'installed') return <CheckCircleIcon color={okColor.value} />;
  return <UnknownIcon />;
};

export const getClusterStatusText = (cluster: Cluster) =>
  CLUSTER_STATUS_LABELS[cluster.status] || cluster.status;

const ClusterStatus: React.FC<ClusterStatusProps> = ({ cluster }) => {
  const { status, statusInfo, statusUpdatedAt } = cluster;
  const title = getClusterStatusText(cluster);
  const icon = getStatusIcon(status);
  if (statusInfo) {
    return (
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={<div>{statusInfo}</div>}
        footerContent={<small>Status updated at {getHumanizedDateTime(statusUpdatedAt)}</small>}
        minWidth="30rem"
        maxWidth="50rem"
      >
        <Button variant={ButtonVariant.link} isInline>
          {icon} {title}
        </Button>
      </Popover>
    );
  }
  return (
    <>
      {icon} {title}
    </>
  );
};

export default ClusterStatus;
