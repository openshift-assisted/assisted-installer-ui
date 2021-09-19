import * as React from 'react';
import { getFailingResourceConditions } from '../helpers';
import { AgentClusterInstallK8sResource } from '../../types';
import { SingleResourceAlerts } from '../common/ResourceAlerts';

export type ClusterErrorsProps = {
  agentClusterInstall: AgentClusterInstallK8sResource;
};

export const ClusterErrors: React.FC<ClusterErrorsProps> = ({ agentClusterInstall }) => {
  const agentClusterInstallAlerts = getFailingResourceConditions(agentClusterInstall, [
    'Validated',
  ]);

  return (
    <SingleResourceAlerts
      title="Failing agent cluster installation"
      conditions={agentClusterInstallAlerts}
    />
  );
};
