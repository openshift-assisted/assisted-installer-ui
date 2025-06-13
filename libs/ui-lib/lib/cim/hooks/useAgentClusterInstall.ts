import { AgentClusterInstallModel } from '../types/models';
import { K8sWatchHookListProps, K8sWatchHookProps } from './types';
import { AgentClusterInstallK8sResource } from '../types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useAgentClusterInstall = (props: K8sWatchHookProps | null) =>
  useK8sWatchResource<AgentClusterInstallK8sResource>(
    {
      groupVersionKind: {
        kind: AgentClusterInstallModel.kind,
        version: AgentClusterInstallModel.apiVersion,
        group: AgentClusterInstallModel.apiGroup,
      },
    },
    props,
  );

export const useAgentClusterInstalls = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<AgentClusterInstallK8sResource[]>(
    {
      groupVersionKind: {
        kind: AgentClusterInstallModel.kind,
        version: AgentClusterInstallModel.apiVersion,
        group: AgentClusterInstallModel.apiGroup,
      },
      isList: true,
    },
    props,
  );
