import React from 'react';
import { Popover, Button, ButtonVariant, Text, TextContent } from '@patternfly/react-core';
import { Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostProgress from './HostProgress';
import { HOST_STATUS_LABELS, HOST_STATUS_DETAILS } from '../../config/constants';
import { getHumanizedDateTime } from '../ui/utils';
import { toSentence } from '../ui/table/utils';
import { getHostProgressStageNumber, getHostProgressStages, getHostStatusIcon } from './utils';
import { stringToJSON } from '../../api/utils';
import HostValidationGroups from './HostValidationGroups';

const getPopoverContent = (host: Host) => {
  const { status, statusInfo } = host;
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const statusDetails = HOST_STATUS_DETAILS[status];

  if (['installing', 'installing-in-progress'].includes(status)) {
    return (
      <TextContent>
        <HostProgress host={host} />
      </TextContent>
    );
  }
  if (['error', 'cancelled', 'installing-pending-user-action'].includes(status)) {
    return (
      <TextContent>
        <Text>
          {statusDetails && (
            <>
              {statusDetails} <br />
            </>
          )}
          {toSentence(statusInfo)}
        </Text>
        <HostProgress host={host} />
      </TextContent>
    );
  }
  return (
    <>
      <TextContent>
        <Text>
          {statusDetails && (
            <>
              {statusDetails}
              <br />
            </>
          )}
          {toSentence(statusInfo)}
        </Text>
      </TextContent>
      <HostValidationGroups validationsInfo={validationsInfo} />
    </>
  );
};

type HostStatusProps = {
  host: Host;
};

const HostStatus: React.FC<HostStatusProps> = ({ host }) => {
  const { status, statusUpdatedAt } = host;
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getHostStatusIcon(status) || null;
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
        <Button variant={ButtonVariant.link} isInline>
          {icon} {title}{' '}
          {['installing', 'installing-in-progress', 'error', 'cancelled'].includes(status) && (
            <>
              {getHostProgressStageNumber(host)}/{hostProgressStages.length}
            </>
          )}
        </Button>
      </Popover>
      {status === 'installing-pending-user-action' && (
        <div className="hosts-table-sublabel">Action required</div>
      )}
    </>
  );
};

export default HostStatus;
