import { useK8sWatchResource } from './useK8sWatchResource';
import { AgentServiceConfigK8sResource } from '../types';
import { K8sWatchHookProps } from './types';

export const useAgentServiceConfig = (props: K8sWatchHookProps) =>
  useK8sWatchResource<AgentServiceConfigK8sResource>(
    {
      groupVersionKind: {
        group: 'agent-install.openshift.io',
        kind: 'AgentServiceConfig',
        version: 'v1beta1',
      },
    },
    props,
  );
