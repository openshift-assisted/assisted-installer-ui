import * as React from 'react';
import { Host, HostStatus, stringToJSON } from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../../../ocm/components/clusterWizard/wizardTransition';
import { AdditionalNTPSourcesDialogToggle } from '../../../ocm/components/hosts/AdditionaNTPSourceDialogToggle';

type HostNetworkingStatusComponentProps = {
  host: Host;
  onEditHostname?: () => void;
};

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = ({
  host,
  onEditHostname,
}) => {
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const networkingStatus = getWizardStepHostStatus(host, 'networking');
  const netValidationsInfo = getWizardStepHostValidationsInfo(validationsInfo, 'networking');
  const sublabel = getFailingClusterWizardSoftValidationIds(validationsInfo, 'networking').length
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      host={host}
      onEditHostname={onEditHostname}
      statusOverride={networkingStatus === 'pending-for-input' ? 'Bound' : networkingStatus}
      validationsInfo={netValidationsInfo}
      sublabel={sublabel}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

export default NetworkingStatus;
