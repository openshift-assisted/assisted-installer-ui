import * as React from 'react';
import { getFailingAgentConditions, getFailingResourceConditions } from '../helpers';
import { AgentK8sResource, InfraEnvK8sResource } from '../../types';
import { AgentAlerts, SingleResourceAlerts } from '../common/ResourceAlerts';

export type EnvironmentErrorsProps = {
  infraEnv: InfraEnvK8sResource;
  infraAgents: AgentK8sResource[];
  // bareMetalHosts: BareMetalHostK8sResource[]; // TODO(mlibra)
};

export const EnvironmentErrors: React.FC<EnvironmentErrorsProps> = ({ infraEnv, infraAgents }) => {
  const infraEnvAlerts = getFailingResourceConditions(infraEnv);
  const agentsAlerts = getFailingAgentConditions(infraAgents);

  return (
    <>
      <SingleResourceAlerts
        title="Failing infrastructure environment"
        conditions={infraEnvAlerts}
      />

      <AgentAlerts agentsAlerts={agentsAlerts} />
    </>
  );
};
