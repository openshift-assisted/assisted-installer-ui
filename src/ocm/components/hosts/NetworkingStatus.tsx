import React from 'react';
import { HostStatus } from '../../../common';
import { HostNetworkingStatusComponentProps } from '../../../common/components/hosts/NetworkingHostsTable';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../clusterWizard/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from './AdditionaNTPSourceDialogToggle';

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = (props) => {
  const networkingStatus = getWizardStepHostStatus(props.host, 'networking');
  const validationsInfo = getWizardStepHostValidationsInfo(props.validationsInfo, 'networking');
  const sublabel = getFailingClusterWizardSoftValidationIds(validationsInfo, 'networking').length
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
