import React from 'react';
import {
  areOnlySoftValidationsFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  HostNetworkingStatusComponentProps,
  hostStatus,
  HostStatus,
} from '../../../common';
import { wizardStepsValidationsMap } from '../clusterWizard/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = (props) => {
  const networkingStatus = getWizardStepHostStatus(
    'networking',
    wizardStepsValidationsMap,
    props.host,
  );
  const status = hostStatus[networkingStatus];
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  );
  status.sublabel = areOnlySoftValidationsFailing(
    validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      {...props}
      status={status}
      validationsInfo={validationsInfo}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

export default NetworkingStatus;
