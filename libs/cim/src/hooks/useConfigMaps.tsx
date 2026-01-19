import { useK8sWatchResource } from './useK8sWatchResource';
import { ConfigMapK8sResource } from '../types';
import { K8sWatchHookProps } from './types';

export const useConfigMaps = (props: K8sWatchHookProps) =>
  useK8sWatchResource<ConfigMapK8sResource[]>(
    {
      groupVersionKind: {
        kind: 'ConfigMap',
        version: 'v1',
      },
    },
    props,
  );
