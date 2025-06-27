import { AgentServiceConfigK8sResource } from '../types';
import { AgentServiceConfigModel } from '../types/models';
import { K8sWatchHookListProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useAgentServiceConfigs = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<AgentServiceConfigK8sResource[]>(
    {
      groupVersionKind: {
        kind: AgentServiceConfigModel.kind,
        version: AgentServiceConfigModel.apiVersion,
        group: AgentServiceConfigModel.apiGroup,
      },
      isList: true,
    },
    props,
  );
