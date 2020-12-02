import React from 'react';
import { Validation, ValidationsInfo } from '../../types/hosts';
import HostPropertyValidationPopover from './HostPropertyValidationPopover';

const getLabel = (validationStatus?: Validation['status']) => {
  switch (validationStatus) {
    case 'failure':
      return 'Unreachable';
    case 'success':
      return 'Synced';
    default:
      return 'Pending';
  }
};

const NtpValidationStatus: React.FC<{ validationsInfo: ValidationsInfo }> = ({
  validationsInfo,
}) => {
  const ntpSyncedValidation = validationsInfo.network?.find((v) => v.id === 'ntp-synced');
  return (
    <HostPropertyValidationPopover validation={ntpSyncedValidation} showSuccess showPending>
      {getLabel(ntpSyncedValidation?.status)}
    </HostPropertyValidationPopover>
  );
};
export default NtpValidationStatus;
