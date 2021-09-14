import * as React from 'react';
import { getFailingAgentConditions, getFailingResourceConditions } from '../helpers';
import {
  AgentK8sResource,
  ClusterDeploymentK8sResource,
  AgentClusterInstallK8sResource,
} from '../../types';
import { AgentAlerts, SingleResourceAlerts } from '../common/ResourceAlerts';

export type ClusterErrorsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  clusterAgents: AgentK8sResource[];
};

export const ClusterErrors: React.FC<ClusterErrorsProps> = ({
  clusterDeployment,
  agentClusterInstall,
  clusterAgents,
}) => {
  const clusterDeploymentAlerts = getFailingResourceConditions(clusterDeployment);
  const agentClusterInstallAlerts = getFailingResourceConditions(agentClusterInstall);
  const agentsAlerts = getFailingAgentConditions(clusterAgents);

  return (
    <>
      <SingleResourceAlerts
        title="Failing cluster deployment"
        conditions={clusterDeploymentAlerts}
      />

      <SingleResourceAlerts
        title="Failing agent cluster installation"
        conditions={agentClusterInstallAlerts}
      />

      <AgentAlerts agentsAlerts={agentsAlerts} />
    </>
  );
};
