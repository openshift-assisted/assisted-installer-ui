import React from 'react';
import { Popover, Button, ButtonVariant } from '@patternfly/react-core';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  FileAltIcon,
  CheckCircleIcon,
  InProgressIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';
import { getHumanizedDateTime } from '../ui/utils';

type ClusterStatusProps = {
  cluster: Cluster;
};

const getStatusIcon = (status: Cluster['status']): React.ReactElement => {
  switch (status) {
    case 'insufficient':
      return <FileAltIcon />;
    case 'pending-for-input':
      return <PendingIcon />;
    case 'ready':
      return <CheckCircleIcon color={okColor.value} />;
    case 'preparing-for-installation':
      return <InProgressIcon />;
    case 'installing':
      return <InProgressIcon />;
    case 'error':
      return <ExclamationCircleIcon color={dangerColor.value} />;
    case 'installed':
      return <CheckCircleIcon color={okColor.value} />;
    case 'finalizing':
      return <InProgressIcon />;
    case 'adding-hosts':
      return <InProgressIcon />;
  }
};

export const getClusterStatusText = (cluster: Cluster) =>
  CLUSTER_STATUS_LABELS[cluster.status] || cluster.status;

const ClusterStatus: React.FC<ClusterStatusProps> = ({ cluster }) => {
  const { status, statusInfo, statusUpdatedAt } = cluster;
  const title = getClusterStatusText(cluster);
  const icon = getStatusIcon(status) || null;
  if (statusInfo) {
    return (
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={<div>{statusInfo}</div>}
        footerContent={<small>Status updated at {getHumanizedDateTime(statusUpdatedAt)}</small>}
        minWidth="30rem"
        maxWidth="50rem"
      >
        <Button variant={ButtonVariant.link} isInline id={`button-cluster-status-${cluster.name}`}>
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
