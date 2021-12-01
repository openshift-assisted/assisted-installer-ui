import * as React from 'react';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  Host,
  HostStatus,
  stringToJSON,
} from '../../../common';
import { HostStatusProps } from '../../../common/components/hosts/types';
import { ValidationsInfo } from '../../../common/types/hosts';
// TODO(jtomasek): replace the map with a CIM dedicated one
import { wizardStepsValidationsMap } from '../../../ocm/components/clusterWizard/wizardTransition';
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
  const netValidationsInfo = getWizardStepHostValidationsInfo(
    validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  );
  const sublabel = getFailingClusterWizardSoftValidationIds(
    validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  ).length
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
