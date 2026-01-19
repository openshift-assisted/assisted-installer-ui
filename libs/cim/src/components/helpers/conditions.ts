import { StatusCondition } from '../../types';
import { AgentK8sResource, AgentStatusCondition } from '../../types/k8s/agent';

export const REQUIRED_AGENT_CONDITION_TYPES = ['SpecSynced', 'Connected', 'Validated'];

export const getFailingAgentConditions = (agents: AgentK8sResource[] = []) => {
  const agentsAlerts: Record<string, AgentStatusCondition[]> = {};
  const ofType = REQUIRED_AGENT_CONDITION_TYPES;

  agents.forEach((a) => {
    const failingConds = a.status?.conditions?.filter(
      (condition) => ofType.includes(condition.type) && condition.status === 'False',
    );
    if (failingConds?.length) {
      agentsAlerts[a.metadata?.name || 'unknownname'] = failingConds;
    }
  });

  return agentsAlerts;
};

export const getFailingResourceConditions = (
  resource: {
    status?: {
      conditions?: StatusCondition<string>[];
    };
  } = {},
  // ofType === unknown matches ALL condition types
  ofType?: string[],
): StatusCondition<string>[] =>
  resource.status?.conditions?.filter(
    (c) => (!ofType || ofType?.includes(c.type)) && c.status === 'False',
  ) || [];
