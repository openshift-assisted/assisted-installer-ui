import { useK8sWatchResource } from './useK8sWatchResource';
import { StorageClassK8sResource } from '../types';
import { K8sWatchHookProps } from './types';

export const useStorageClasses = (props: K8sWatchHookProps) =>
  useK8sWatchResource<StorageClassK8sResource[]>(
    {
      groupVersionKind: {
        group: 'storage.k8s.io',
        kind: 'StorageClass',
        version: 'v1',
      },
    },
    props,
  );
