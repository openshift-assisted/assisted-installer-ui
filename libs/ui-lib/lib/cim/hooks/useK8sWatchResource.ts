import {
  useK8sWatchResource as consoleWatch,
  K8sResourceCommon,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

export type WatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  R,
  boolean,
  unknown,
];

export const useK8sWatchResource = <R extends K8sResourceCommon | K8sResourceCommon[]>(
  resource: Pick<WatchK8sResource, 'groupVersionKind' | 'isList'>,
  props?: Omit<WatchK8sResource, 'groupVersionKind' | 'isList'> | null,
): WatchK8sResult<R> => {
  // eslint-disable-next-line
  const [data, loaded, error] = consoleWatch<R>(
    props !== null
      ? {
          ...resource,
          ...(props || {}),
        }
      : null,
  );
  return [data, error ? true : loaded, error as unknown];
};
