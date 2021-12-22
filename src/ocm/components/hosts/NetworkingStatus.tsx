import React from 'react';
import {
  areOnlySoftValidationsFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  HostNetworkingStatusComponentProps,
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
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  );
  const sublabel = areOnlySoftValidationsFailing(
    validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      {...props}
      statusOverride={networkingStatus}
      validationsInfo={validationsInfo}
      sublabel={sublabel}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

export default NetworkingStatus;
