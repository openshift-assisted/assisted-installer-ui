import React from 'react';
import { Cluster, Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostStatus from './HostStatus';
import {
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../clusterWizard/wizardTransition';

type HardwareStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  cluster: Cluster;
};

const HardwareStatus: React.FC<HardwareStatusProps> = (props) => {
  const hardwareStatus = getWizardStepHostStatus(props.host, 'baremetal-discovery');
  const validationsInfo = getWizardStepHostValidationsInfo(
    props.validationsInfo,
    'baremetal-discovery',
  );
  return (
    <HostStatus {...props} statusOverride={hardwareStatus} validationsInfo={validationsInfo} />
  );
};

export default HardwareStatus;
