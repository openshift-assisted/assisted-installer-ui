import { SecretK8sResource } from '../types';
import { SecretModel } from '../types/models';
import { K8sWatchHookListProps, K8sWatchHookProps } from './types';
import { useK8sWatchResource } from './useK8sWatchResource';

export const useSecrets = (props?: K8sWatchHookListProps) =>
  useK8sWatchResource<SecretK8sResource[]>(
    {
      groupVersionKind: {
        kind: SecretModel.kind,
        version: SecretModel.apiVersion,
      },
      isList: true,
    },
    props,
  );

export const useSecret = (props: K8sWatchHookProps) =>
  useK8sWatchResource<SecretK8sResource>(
    {
      groupVersionKind: {
        kind: SecretModel.kind,
        version: SecretModel.apiVersion,
        group: SecretModel.apiGroup,
      },
      isList: false,
    },
    props,
  );
