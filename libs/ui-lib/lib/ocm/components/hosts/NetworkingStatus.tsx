import React from 'react';
import {
  areOnlySoftValidationsOfWizardStepFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  HostNetworkingStatusComponentProps,
  hostStatus,
  HostStatus,
  useTranslation,
} from '../../../common';
import { wizardStepsValidationsMap } from '../wizard/utils/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';

export const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = (props) => {
  const { t } = useTranslation();
  const networkingStatus = getWizardStepHostStatus(
    'networking',
    wizardStepsValidationsMap,
    props.host,
  );
  const status = hostStatus(t)[networkingStatus];
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  );
  const sublabel = areOnlySoftValidationsOfWizardStepFailing(
    validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      {...props}
      status={{ ...status, sublabel }}
      validationsInfo={validationsInfo}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};
