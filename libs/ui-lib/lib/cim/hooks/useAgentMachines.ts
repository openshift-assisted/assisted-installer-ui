import { AgentMachineK8sResource } from '../components';
import { AgentMachineModel } from '../types/models';
import { K8sWatchHookListProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useAgentMachines = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<AgentMachineK8sResource[]>(
    {
      groupVersionKind: {
        kind: AgentMachineModel.kind,
        version: AgentMachineModel.apiVersion,
        group: AgentMachineModel.apiGroup,
      },
      isList: true,
    },
    props,
  );
