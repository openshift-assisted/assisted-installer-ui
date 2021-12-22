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
import { wizardStepsValidationsMap } from '../ClusterDeployment/wizardTransition';

type HostHardwareStatusComponentProps = {
  host: Host;
  onEditHostname?: () => void;
};

const HardwareStatus: React.FC<HostHardwareStatusComponentProps> = ({ host, onEditHostname }) => {
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const status = getWizardStepHostStatus('hosts-selection', wizardStepsValidationsMap, host);
  const hardwareValidationsInfo = getWizardStepHostValidationsInfo(
    validationsInfo,
    'hosts-selection',
    wizardStepsValidationsMap,
  );
  const sublabel = areOnlySoftValidationsFailing(
    validationsInfo,
    'hosts-selection',
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  const statusOverride: HostStatusProps['statusOverride'] = status;

  return (
    <HostStatus
      host={host}
      onEditHostname={onEditHostname}
      statusOverride={statusOverride}
      validationsInfo={hardwareValidationsInfo}
      sublabel={sublabel}
    />
  );
};

export default HardwareStatus;
