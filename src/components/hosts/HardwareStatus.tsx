import React from 'react';
import { Cluster, Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostStatus from './HostStatus';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../clusterWizard/wizardTransition';

type HardwareStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  cluster: Cluster;
  testId?: string;
};

const HardwareStatus: React.FC<HardwareStatusProps> = (props) => {
  const hardwareStatus = getWizardStepHostStatus(props.host, 'baremetal-discovery');
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'baremetal-discovery',
  );
  const sublabel = getFailingClusterWizardSoftValidationIds(validationsInfo, 'baremetal-discovery')
    .length
    ? 'Some validations failed'
    : undefined;

  return (
    <HostStatus
      {...props}
      statusOverride={hardwareStatus}
      validationsInfo={validationsInfo}
      sublabel={sublabel}
    />
  );
};

export default HardwareStatus;
