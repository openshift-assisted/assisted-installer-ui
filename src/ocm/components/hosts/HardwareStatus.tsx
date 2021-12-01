import React from 'react';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  Host,
  HostStatus,
} from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import { wizardStepsValidationsMap } from '../clusterWizard/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';

type HardwareStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
};

const HardwareStatus: React.FC<HardwareStatusProps> = (props) => {
  const hardwareStatus = getWizardStepHostStatus(
    'host-discovery',
    wizardStepsValidationsMap,
    props.host,
  );
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'host-discovery',
    wizardStepsValidationsMap,
  );
  const sublabel = getFailingClusterWizardSoftValidationIds(
    validationsInfo,
    'host-discovery',
    wizardStepsValidationsMap,
  ).length
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      {...props}
      statusOverride={hardwareStatus}
      validationsInfo={validationsInfo}
      sublabel={sublabel}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

export default HardwareStatus;
