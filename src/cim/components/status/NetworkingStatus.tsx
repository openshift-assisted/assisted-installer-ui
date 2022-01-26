import * as React from 'react';
import {
  areOnlySoftValidationsFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  Host,
  HostStatus,
  stringToJSON,
} from '../../../common';
import { HostStatusProps } from '../../../common/components/hosts/types';
import { ValidationsInfo } from '../../../common/types/hosts';
import { AdditionalNTPSourcesDialogToggle } from '../ClusterDeployment/AdditionalNTPSourcesDialogToggle';
import { wizardStepsValidationsMap } from '../ClusterDeployment/wizardTransition';

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
  const sublabel = areOnlySoftValidationsFailing(
    validationsInfo,
    'networking',
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  const statusOverride: HostStatusProps['statusOverride'] = networkingStatus;

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
