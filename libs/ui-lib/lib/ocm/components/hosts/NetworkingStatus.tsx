import React from 'react';
import {
  areOnlySoftValidationsOfWizardStepFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  HostNetworkingStatusComponentProps,
  hostStatus,
  HostStatus,
} from '../../../common';
import { wizardStepsValidationsMap } from '../clusterWizard/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = (props) => {
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

export default NetworkingStatus;
