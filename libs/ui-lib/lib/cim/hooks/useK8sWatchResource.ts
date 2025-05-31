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
  props: WatchK8sResource | null,
): WatchK8sResult<R> => {
  // eslint-disable-next-line
  const [data, loaded, error] = consoleWatch<R>(props);
  return [data, error ? true : loaded, error as unknown];
};
