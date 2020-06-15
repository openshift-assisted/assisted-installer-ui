import React from 'react';
import { Popover, Button, ButtonVariant } from '@patternfly/react-core';
import {
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  WarningTriangleIcon,
  InProgressIcon,
  DisconnectedIcon,
  ConnectedIcon,
  OffIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { Host } from '../../api/types';
import HostProgress from './HostProgress';
import { HOST_STATUS_LABELS, HOST_STATUS_DETAILS } from '../../config/constants';

import './HostStatus.css';
import { getHumanizedDateTime } from '../ui/utils';

const getStatusIcon = (status: Host['status']) => {
  if (status === 'discovering') return <ConnectedIcon />;
  if (status === 'known') return <CheckCircleIcon color={okColor.value} />;
  if (status === 'disconnected') return <DisconnectedIcon />;
  if (status === 'disabled') return <OffIcon />;
  if (status === 'insufficient') return <WarningTriangleIcon color={warningColor.value} />;
  if (status === 'installing') return <InProgressIcon />;
  if (status === 'installing-in-progress') return <InProgressIcon />;
  if (status === 'error') return <ExclamationCircleIcon color={dangerColor.value} />;
  if (status === 'installed') return <CheckCircleIcon color={okColor.value} />;
  return <UnknownIcon />;
};

export const getHostInstallationSteps = (role: Host['role'], bootstrap: Host['bootstrap']) => {
  if (bootstrap) {
    return [
      'Starting installation',
      `Installing as ${role}`,
      'Bootstrapping installation',
      'Writing image to disk',
      'Waiting for control plane',
      'Rebooting',
      'Done',
    ];
  } else if (role === 'master') {
    return [
      'Starting installation',
      `Installing as ${role}`,
      'Writing image to disk',
      'Rebooting',
      'Joined',
      'Done',
    ];
  } else {
    return [
      'Starting installation',
      `Installing as ${role}`,
      'Writing image to disk',
      'Rebooting',
      'Done',
    ];
  }
};

type HostStatusProps = {
  host: Host;
};

const HostStatus: React.FC<HostStatusProps> = ({ host }) => {
  const { status, statusInfo, statusUpdatedAt, role, bootstrap } = host;
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status);

  const progressInfo = {
    steps: getHostInstallationSteps(role, bootstrap),
    currentStep: statusInfo || 'Starting Installation',
  };

  const currentStepNumber = progressInfo.steps.indexOf(progressInfo.currentStep) + 1;
  const bodyContent = React.useMemo(
    () => (
      <div>
        {['installing', 'installing-in-progress'].includes(status) ? (
          <>
            <HostProgress status={status} progressInfo={progressInfo} />
            <br />
          </>
        ) : (
          <>
            <p>{HOST_STATUS_DETAILS[status] || ''}</p>
            <p>{statusInfo}</p>
          </>
        )}
      </div>
    ),
    [status, progressInfo, statusInfo],
  );
  return (
    <>
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={bodyContent}
        footerContent={<small>Status updated at {getHumanizedDateTime(statusUpdatedAt)}</small>}
        minWidth="30rem"
        maxWidth="50rem"
      >
        <Button variant={ButtonVariant.link} className="host-status__button" isInline>
          {icon} {title}{' '}
          {['installing', 'installing-in-progress'].includes(status) && (
            <>
              {currentStepNumber}/{progressInfo.steps.length}
            </>
          )}
        </Button>
      </Popover>
    </>
  );
};

export default HostStatus;
