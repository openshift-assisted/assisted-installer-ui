import { ConfigMapK8sResource } from '../types';
import { K8sWatchHookProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useConfigMap = (props: K8sWatchHookProps) =>
  useK8sWatchResource<ConfigMapK8sResource>(
    {
      groupVersionKind: {
        kind: 'ConfigMap',
        version: 'v1',
      },
    },
    props,
  );
