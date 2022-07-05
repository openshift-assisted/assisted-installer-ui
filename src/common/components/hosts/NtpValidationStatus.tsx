import React from 'react';
import { Validation, ValidationsInfo } from '../../../common/types/hosts';
import HostPropertyValidationPopover from './HostPropertyValidationPopover';
import { ValidationInfoActionProps } from './HostValidationGroups';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

const getLabel = (t: TFunction, validationStatus?: Validation['status']) => {
  switch (validationStatus) {
    case 'failure':
      return t('ai:Unreachable');
    case 'success':
      return t('ai:Synced');
    default:
      return t('ai:Not available');
  }
};

type NtpValidationsStatusProps = {
  validationsInfo: ValidationsInfo;
  AdditionalNTPSourcesDialogToggleComponent: ValidationInfoActionProps['AdditionalNTPSourcesDialogToggleComponent'];
};

const NtpValidationStatus: React.FC<NtpValidationsStatusProps> = ({
  validationsInfo,
  AdditionalNTPSourcesDialogToggleComponent,
}) => {
  const ntpSyncedValidation = validationsInfo.network?.find((v) => v.id === 'ntp-synced');
  const actions = [];
  if (AdditionalNTPSourcesDialogToggleComponent) {
    actions.push(<AdditionalNTPSourcesDialogToggleComponent key="add-ntp-sources" />);
  }
  const { t } = useTranslation();
  return (
    <HostPropertyValidationPopover
      validation={ntpSyncedValidation}
      failureActions={actions}
      pendingActions={actions}
      showSuccess
      showPending
    >
      {getLabel(t, ntpSyncedValidation?.status)}
    </HostPropertyValidationPopover>
  );
};
export default NtpValidationStatus;
