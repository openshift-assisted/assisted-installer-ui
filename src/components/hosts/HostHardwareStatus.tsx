import React from 'react';
import { Popover, Button, ButtonVariant, Text, TextContent } from '@patternfly/react-core';
import { Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import { HOST_STATUS_LABELS, HOST_HARDWARE_STATUS_DETAILS } from '../../config/constants';
import { getHumanizedDateTime } from '../ui/utils';
import { getHostStatusIcon } from './utils';
import { stringToJSON } from '../../api/utils';
import HostValidationGroups from './HostValidationGroups';

// TODO(jtomasek): this should get replaced with hardwareStatus returned from backend
const getHostHardwareStatus = (
  hardwareValidations: ValidationsInfo['hardware'] = [],
  status: Host['status'],
): Host['status'] => {
  const failedHardwareValidations = hardwareValidations.filter(
    (validation) => validation.status === 'failure',
  );
  const pendingHardwareValidations = hardwareValidations.filter(
    (validation) => validation.status === 'pending',
  );
  if (['insufficient', 'pending-for-input'].includes(status)) {
    if (failedHardwareValidations?.length) {
      return 'insufficient';
    }
    if (pendingHardwareValidations?.length) {
      return 'pending-for-input';
    }
    return 'known';
  }
  return status;
};

const getPopoverContent = (status: Host['status'], validationsInfo: ValidationsInfo) => {
  const statusDetails = HOST_HARDWARE_STATUS_DETAILS[status];

  return (
    <>
      <TextContent>
        <Text>{statusDetails && statusDetails}</Text>
      </TextContent>
      <HostValidationGroups validationsInfo={{ hardware: validationsInfo.hardware }} />
    </>
  );
};

type HostStatusProps = {
  host: Host;
};

const HostHardwareStatus: React.FC<HostStatusProps> = ({ host }) => {
  const { statusUpdatedAt } = host;
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const status = getHostHardwareStatus(validationsInfo.hardware, host.status);
  const title = HOST_STATUS_LABELS[status] || status;
  const icon = getHostStatusIcon(status) || null;

  return (
    <>
      <Popover
        headerContent={<div>{title}</div>}
        bodyContent={getPopoverContent(status, validationsInfo)}
        footerContent={<small>Status updated at {getHumanizedDateTime(statusUpdatedAt)}</small>}
        minWidth="30rem"
        maxWidth="50rem"
      >
        <Button variant={ButtonVariant.link} isInline>
          {icon} {title}
        </Button>
      </Popover>
    </>
  );
};

export default HostHardwareStatus;
