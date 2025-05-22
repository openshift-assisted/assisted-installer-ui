import { Selector } from '@openshift-console/dynamic-plugin-sdk';
import { AgentK8sResource, InfraEnvK8sResource } from '../types';
import { AgentModel } from '../types/models';
import { useK8sWatchResource, WatchK8sResult } from './useK8sWatchResource';

export const useInfraEnvAgents = (
  infraEnv: InfraEnvK8sResource | undefined,
): WatchK8sResult<AgentK8sResource[]> => {
  const selector: Selector = {};
  if (infraEnv?.status?.agentLabelSelector?.matchLabels) {
    selector.matchLabels = infraEnv.status.agentLabelSelector.matchLabels;
  }
  if (infraEnv?.status?.agentLabelSelector?.matchExpressions) {
    selector.matchExpressions = infraEnv.status.agentLabelSelector.matchExpressions;
  }

  const [agents, loaded, err] = useK8sWatchResource<AgentK8sResource[]>(
    infraEnv
      ? {
          groupVersionKind: {
            kind: AgentModel.kind,
            version: AgentModel.apiVersion,
            group: AgentModel.apiGroup,
          },
          namespace: infraEnv.metadata?.namespace,
          isList: true,
          selector,
        }
      : null,
  );

  return [agents, loaded, err];
};
