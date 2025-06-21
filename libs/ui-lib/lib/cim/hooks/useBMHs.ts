import { BareMetalHostK8sResource } from '../types';
import { BMHModel } from '../types/models';
import { K8sWatchHookListProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useBMHs = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<BareMetalHostK8sResource[]>(
    {
      groupVersionKind: {
        kind: BMHModel.kind,
        version: BMHModel.apiVersion,
        group: BMHModel.apiGroup,
      },
      isList: true,
    },
    props,
  );
