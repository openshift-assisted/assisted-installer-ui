import { AgentK8sResource } from '../types';
import { AgentModel } from '../types/models';
import { K8sWatchHookListProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useAgents = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<AgentK8sResource[]>(
    {
      groupVersionKind: {
        kind: AgentModel.kind,
        version: AgentModel.apiVersion,
        group: AgentModel.apiGroup,
      },
      isList: true,
    },
    props,
  );
