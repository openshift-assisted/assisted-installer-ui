import { useK8sWatchResource } from './useK8sWatchResource';
import { EventK8sResource } from '../types';
import { K8sWatchHookProps } from './types';

export const useEvents = (props: K8sWatchHookProps) =>
  useK8sWatchResource<EventK8sResource[]>(
    {
      groupVersionKind: {
        kind: 'Event',
        version: 'v1',
      },
    },
    props,
  );
