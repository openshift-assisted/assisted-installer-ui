import {
  useK8sWatchResource as consoleWatch,
  K8sResourceCommon,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

type WatchK8sResult<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, unknown];
type UseK8sWatchResource = <R extends K8sResourceCommon | K8sResourceCommon[]>(
  initResource: WatchK8sResource | null,
) => WatchK8sResult<R>;

export const useK8sWatchResource: UseK8sWatchResource = (props) => consoleWatch(props);
