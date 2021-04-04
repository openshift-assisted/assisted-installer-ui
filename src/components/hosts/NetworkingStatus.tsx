import React from 'react';
import { Cluster, Host } from '../../api/types';
import { ValidationsInfo } from '../../types/hosts';
import HostStatus from './HostStatus';
import {
  getFailingClusterWizardSoftValidationIds,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
} from '../clusterWizard/wizardTransition';

type NetworkingStatusProps = {
  host: Host;
  validationsInfo: ValidationsInfo;
  cluster: Cluster;
};

const NetworkingStatus: React.FC<NetworkingStatusProps & WithTestID> = (props) => {
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
    />
  );
};

export default NetworkingStatus;
