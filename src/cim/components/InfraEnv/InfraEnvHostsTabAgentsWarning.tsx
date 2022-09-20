import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { getAgentStatus, getBMHStatus } from '../helpers';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common';

export type InfraEnvHostsTabAgentsWarning = {
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
};

const InfraEnvHostsTabAgentsWarning: React.FC<InfraEnvHostsTabAgentsWarning> = ({
  infraAgents,
  infraBMHs,
}) => {
  const agentsBMHNames = infraAgents.reduce<string[]>((names, agent) => {
    const name = agent.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY];
    name && names.push(name);
    return names;
  }, []);

  const bmhsWithoutAgents = infraBMHs.filter((bmh) =>
    agentsBMHNames.includes(bmh.metadata?.name || ''),
  );

  const agentStates = infraAgents.map((agent) => getAgentStatus(agent, true).status);
  const bmhStates = bmhsWithoutAgents.map((bmh) => getBMHStatus(bmh).state);

  const hostStates = [...agentStates, ...bmhStates];

  const problemStates = [
    'bmh-error',
    'preparing-failed',
    'disconnected-unbound',
    'disconnected',
    'insufficient-unbound',
    'insufficient',
    'cancelled',
    'error',
  ];

  if (hostStates.some(({ key }) => problemStates.includes(key))) {
    return (
      <ExclamationTriangleIcon
        color={warningColor.value}
        className="infra-env-hosts-tab-title__icon"
      />
    );
  }
  return null;
};

export default InfraEnvHostsTabAgentsWarning;
