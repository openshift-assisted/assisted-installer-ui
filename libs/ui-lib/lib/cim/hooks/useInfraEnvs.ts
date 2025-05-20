import { InfraEnvK8sResource } from '../types';
import { InfraEnvModel } from '../types/models';
import { K8sWatchHookListProps, K8sWatchHookProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useInfraEnvs = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<InfraEnvK8sResource[]>(
    {
      groupVersionKind: {
        kind: InfraEnvModel.kind,
        version: InfraEnvModel.apiVersion,
        group: InfraEnvModel.apiGroup,
      },
      isList: true,
    },
    props,
  );

export const useInfraEnv = (props?: K8sWatchHookProps) =>
  useK8sWatchResource<InfraEnvK8sResource>(
    {
      groupVersionKind: {
        kind: InfraEnvModel.kind,
        version: InfraEnvModel.apiVersion,
        group: InfraEnvModel.apiGroup,
      },
    },
    props,
  );
