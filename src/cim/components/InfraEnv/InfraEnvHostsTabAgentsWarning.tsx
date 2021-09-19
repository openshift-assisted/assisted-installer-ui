import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { getFailingAgentConditions } from '../helpers';
import { AgentK8sResource } from '../../types';

export type InfraEnvHostsTabAgentsWarning = {
  infraAgents: AgentK8sResource[];
};

const InfraEnvHostsTabAgentsWarning: React.FC<InfraEnvHostsTabAgentsWarning> = ({
  infraAgents,
}) => {
  const faiingAgentConditions = getFailingAgentConditions(infraAgents);
  const failingAgentNames = Object.getOwnPropertyNames(faiingAgentConditions);
  if (!failingAgentNames.length) {
    return null;
  }

  return (
    <ExclamationTriangleIcon
      color={warningColor.value}
      className="infra-env-hosts-tab-title__icon"
    />
  );
};

export default InfraEnvHostsTabAgentsWarning;
