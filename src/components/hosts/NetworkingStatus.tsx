import React from 'react';
import { Cluster, Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostStatus from './HostStatus';
import {
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../clusterWizard/wizardTransition';

type NetworkingStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  cluster: Cluster;
};

const NetworkingStatus: React.FC<NetworkingStatusProps> = (props) => {
  const networkingStatus = getWizardStepHostStatus(props.host, 'networking');
  const validationsInfo = getWizardStepHostValidationsInfo(props.validationsInfo, 'networking');
  return (
    <HostStatus {...props} statusOverride={networkingStatus} validationsInfo={validationsInfo} />
  );
};

export default NetworkingStatus;
