import React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from '../../hooks';
import { Validation, ValidationsInfo } from '../../types/hosts';
import { HostPropertyValidationPopover } from './HostPropertyValidationPopover';
import { ValidationInfoActionProps } from './HostValidationGroups';

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
  AdditionalNTPSourcesDialogToggleComponent?: ValidationInfoActionProps['AdditionalNTPSourcesDialogToggleComponent'];
  NtpSyncFailureMessageComponent?: ValidationInfoActionProps['NtpSyncFailureMessageComponent'];
};

export const NtpValidationStatus: React.FC<NtpValidationsStatusProps> = ({
  validationsInfo,
  AdditionalNTPSourcesDialogToggleComponent,
  NtpSyncFailureMessageComponent,
}) => {
  const ntpSyncedValidation = validationsInfo.network?.find((v) => v.id === 'ntp-synced');
  const actions = [];
  if (AdditionalNTPSourcesDialogToggleComponent) {
    actions.push(<AdditionalNTPSourcesDialogToggleComponent key="add-ntp-sources" />);
  }
  const bodyContent = NtpSyncFailureMessageComponent ? (
    <NtpSyncFailureMessageComponent />
  ) : undefined;
  const { t } = useTranslation();
  return (
    <HostPropertyValidationPopover
      validation={ntpSyncedValidation}
      failureActions={actions}
      failureBodyContent={bodyContent}
      showSuccess
    >
      {getLabel(t, ntpSyncedValidation?.status)}
    </HostPropertyValidationPopover>
  );
};
