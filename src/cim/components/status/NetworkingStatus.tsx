import * as React from 'react';
import { Host, HostStatus, stringToJSON } from '../../../common';
import { HostStatusProps } from '../../../common/components/hosts/types';
import { ValidationsInfo } from '../../../common/types/hosts';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  wizardStepsValidationsMap,
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
  const networkingStatus = getWizardStepHostStatus('networking', wizardStepsValidationsMap, host);
  const netValidationsInfo = getWizardStepHostValidationsInfo(validationsInfo, 'networking');
  const sublabel = getFailingClusterWizardSoftValidationIds(validationsInfo, 'networking').length
    ? 'Some validations failed'
    : undefined;

  let statusOverride: HostStatusProps['statusOverride'] = networkingStatus;
  if (networkingStatus === 'pending-for-input' || networkingStatus === 'insufficient') {
    statusOverride = 'Bound';
  }

  return (
    <HostStatus
      host={host}
      onEditHostname={onEditHostname}
      statusOverride={statusOverride}
      validationsInfo={netValidationsInfo}
      sublabel={sublabel}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
    />
  );
};

export default NetworkingStatus;
