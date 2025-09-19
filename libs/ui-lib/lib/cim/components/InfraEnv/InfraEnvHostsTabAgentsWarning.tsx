import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { t_global_icon_color_status_warning_default as warningColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';
import { getAgentStatus, getBMHStatus } from '../helpers';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common';
import { Tooltip } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { agentStatus, bmhStatus } from '../helpers/agentStatus';

export type InfraEnvHostsTabAgentsWarning = {
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
};

const InfraEnvHostsTabAgentsWarning: React.FC<InfraEnvHostsTabAgentsWarning> = ({
  infraAgents,
  infraBMHs,
}) => {
  const { t } = useTranslation();
  const agentsBMHNames = infraAgents.reduce<string[]>((names, agent) => {
    const name = agent.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY];
    name && names.push(name);
    return names;
  }, []);

  const bmhsWithoutAgents = infraBMHs.filter((bmh) =>
    agentsBMHNames.includes(bmh.metadata?.name || ''),
  );
  const agentStatuses = agentStatus(t);
  const bmhStatuses = bmhStatus(t);

  const agentStates = infraAgents.map((agent) => getAgentStatus(agent, agentStatuses, true).status);
  const bmhStates = bmhsWithoutAgents.map((bmh) => getBMHStatus(bmh, bmhStatuses).state);

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

  const hostsWithProblemsCount = hostStates.filter(({ key }) => problemStates.includes(key)).length;

  if (hostsWithProblemsCount) {
    return (
      <Tooltip content={t('ai:{{count}} host has problems', { count: hostsWithProblemsCount })}>
        <ExclamationTriangleIcon
          color={warningColor.value}
          className="infra-env-hosts-tab-title__icon"
        />
      </Tooltip>
    );
  }
  return null;
};

export default InfraEnvHostsTabAgentsWarning;
