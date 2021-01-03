import React from 'react';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as okColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  FileAltIcon,
  CheckCircleIcon,
  InProgressIcon,
  BanIcon,
  IconSize,
} from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';

type ClusterStatusProps = {
  status: Cluster['status'];
};

const iconProps = {
  size: IconSize.sm,
};

type ClusterStatusIconProps = {
  status: Cluster['status'];
};

export const ClusterStatusIcon: React.FC<ClusterStatusIconProps> = ({ status }) => {
  switch (status) {
    case 'cancelled':
      return <BanIcon {...iconProps} />;
    case 'insufficient':
    case 'pending-for-input':
      return <FileAltIcon {...iconProps} />;
    case 'error':
      return <ExclamationCircleIcon color={dangerColor.value} {...iconProps} />;
    case 'ready':
    case 'installed':
      return <CheckCircleIcon color={okColor.value} {...iconProps} />;
    case 'installing-pending-user-action':
      return <ExclamationTriangleIcon color={warningColor.value} {...iconProps} />;
    case 'preparing-for-installation':
    case 'installing':
    case 'finalizing':
    case 'adding-hosts':
      return <InProgressIcon {...iconProps} />;
    default:
      return <></>;
  }
};

export const getClusterStatusText = (status: Cluster['status']) =>
  CLUSTER_STATUS_LABELS[status] || status;

const ClusterStatus: React.FC<ClusterStatusProps> = ({ status }) => {
  const title = getClusterStatusText(status);

  return (
    <>
      <ClusterStatusIcon status={status} /> {title}
    </>
  );
};

export default ClusterStatus;
