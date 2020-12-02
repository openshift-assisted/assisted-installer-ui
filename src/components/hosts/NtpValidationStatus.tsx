import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as successColor,
} from '@patternfly/react-tokens';
import { ValidationsInfo } from '../../types/hosts';

const NtpValidationStatus: React.FC<{ validationsInfo: ValidationsInfo }> = ({
  validationsInfo,
}) => {
  const ntpSyncedValidation = validationsInfo.network?.find((v) => v.id === 'ntp-synced');
  switch (ntpSyncedValidation?.status) {
    case 'success':
      return (
        <>
          <CheckCircleIcon color={successColor.value} /> Synced
        </>
      );
    case 'failure':
      return (
        <>
          <ExclamationCircleIcon color={dangerColor.value} /> Unreachable (Configure NTP source in
          Advanced networking section)
        </>
      );
    case 'pending':
      return (
        <>
          <PendingIcon /> Pending
        </>
      );
    default:
      return (
        <>
          <ExclamationCircleIcon color={dangerColor.value} /> Failed to validate NTP status
        </>
      );
  }
};
export default NtpValidationStatus;
