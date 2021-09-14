import { StatusCondition } from '../../types';
import { AgentK8sResource } from '../../types/k8s/agent';

export const getFailingAgentConditions = (agents: AgentK8sResource[] = []) => {
  const agentsAlerts = {};
  const ofType = ['Validated'];

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

// What about Unknown status?
export const getFailingResourceConditions = (
  resource: {
    status?: {
      conditions?: StatusCondition<string>[];
    };
  } = {},
  ofType = ['Validated'],
): StatusCondition<string>[] =>
  resource.status?.conditions?.filter((c) => ofType.includes(c.type) && c.status === 'False') || [];
