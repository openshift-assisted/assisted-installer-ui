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
import { getHumanizedDateTime } from '../ui/utils';
import { toSentence } from '../ui/table/utils';
import { getHostProgressStageNumber, getHostProgressStages } from './utils';

import './HostStatus.css';

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
  if (status === 'resetting') return <InProgressIcon />;
  return <UnknownIcon />;
};

type HostStatusProps = {
  host: Host;
};

const HostStatus: React.FC<HostStatusProps> = ({ host }) => {
  const { status, statusInfo, statusUpdatedAt } = host;
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status);
  const hostProgressStages = getHostProgressStages(host);

  const bodyContent = React.useMemo(
    () => (
      <div>
        {['installing', 'installing-in-progress'].includes(status) ? (
          <>
            <HostProgress host={host} />
            <br />
          </>
        ) : (
          <>
            <p>{HOST_STATUS_DETAILS[status] || ''}</p>
            <p>{toSentence(statusInfo)}</p>
          </>
        )}
      </div>
    ),
    [status, statusInfo, host],
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
              {getHostProgressStageNumber(host)}/{hostProgressStages.length}
            </>
          )}
        </Button>
      </Popover>
    </>
  );
};

export default HostStatus;
