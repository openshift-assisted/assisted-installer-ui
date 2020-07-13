import React from 'react';
import { Popover, Button, ButtonVariant, Text, TextContent } from '@patternfly/react-core';
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
  if (status === 'installing-pending-user-action')
    return <WarningTriangleIcon color={warningColor.value} />;
  if (status === 'error') return <ExclamationCircleIcon color={dangerColor.value} />;
  if (status === 'installed') return <CheckCircleIcon color={okColor.value} />;
  if (status === 'resetting') return <InProgressIcon />;
  return <UnknownIcon />;
};

const getPopoverContent = (host: Host) => {
  const { status, statusInfo } = host;
  if (['installing', 'installing-in-progress'].includes(status)) {
    return (
      <TextContent>
        <HostProgress host={host} />
      </TextContent>
    );
  }
  if (['error', 'installing-pending-user-action'].includes(status)) {
    return (
      <TextContent>
        <Text>
          {HOST_STATUS_DETAILS[status] || ''}
          <br />
          {toSentence(statusInfo)}
        </Text>
        <HostProgress host={host} />
      </TextContent>
    );
  }
  return (
    <TextContent>
      <Text>
        {HOST_STATUS_DETAILS[status] || ''}
        <br />
        {toSentence(statusInfo)}
      </Text>
    </TextContent>
  );
};

type HostStatusProps = {
  host: Host;
};

const HostStatus: React.FC<HostStatusProps> = ({ host }) => {
  const { status, statusUpdatedAt } = host;
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getStatusIcon(status);
  const hostProgressStages = getHostProgressStages(host);

  return (
    <>
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={getPopoverContent(host)}
        footerContent={<small>Status updated at {getHumanizedDateTime(statusUpdatedAt)}</small>}
        minWidth="30rem"
        maxWidth="50rem"
      >
        <Button variant={ButtonVariant.link} className="host-status__button" isInline>
          {icon} {title}{' '}
          {['installing', 'installing-in-progress', 'error'].includes(status) && (
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
