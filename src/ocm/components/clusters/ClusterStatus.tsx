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
} from '@patternfly/react-icons';
import { Cluster, CLUSTER_STATUS_LABELS, WithTestID } from '../../../common';

type ClusterStatusProps = {
  status: Cluster['status'];
  className?: string;
};

type ClusterStatusIconProps = {
  status: Cluster['status'];
  className?: string;
};

export const ClusterStatusIcon: React.FC<ClusterStatusIconProps> = ({ status, ...extraProps }) => {
  switch (status) {
    case 'cancelled':
      return <BanIcon size={'sm'} {...extraProps} />;
    case 'insufficient':
    case 'pending-for-input':
    case 'ready':
      return <FileAltIcon size={'sm'} {...extraProps} />;
    case 'error':
      return <ExclamationCircleIcon color={dangerColor.value} size={'sm'} {...extraProps} />;
    case 'installed':
      return <CheckCircleIcon color={okColor.value} size={'sm'} {...extraProps} />;
    case 'installing-pending-user-action':
      return <ExclamationTriangleIcon color={warningColor.value} size={'sm'} {...extraProps} />;
    case 'preparing-for-installation':
    case 'installing':
    case 'finalizing':
    case 'adding-hosts':
      return <InProgressIcon size={'sm'} {...extraProps} />;
    default:
      return <></>;
  }
};

export const getClusterStatusText = (status: Cluster['status']) =>
  CLUSTER_STATUS_LABELS[status] || status;

const ClusterStatus: React.FC<ClusterStatusProps & WithTestID> = ({
  status,
  testId,
  className,
}) => {
  const title = getClusterStatusText(status);

  return (
    <>
      <ClusterStatusIcon status={status} data-testid={testId} className={className} /> {title}
    </>
  );
};

export default ClusterStatus;
