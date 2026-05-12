import { useK8sWatchResource } from './useK8sWatchResource';
import { AgentK8sResource } from '../types';
import { K8sWatchHookProps } from './types';

export const useAgents = (props: K8sWatchHookProps) =>
  useK8sWatchResource<AgentK8sResource[]>(
    {
      groupVersionKind: {
        group: 'agent-install.openshift.io',
        kind: 'Agent',
        version: 'v1beta1',
      },
    },
    props,
  );
