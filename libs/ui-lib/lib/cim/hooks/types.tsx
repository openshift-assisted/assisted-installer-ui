import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

export type K8sWatchHookListProps = Omit<
  WatchK8sResource,
  'groupVersionKind' | 'name' | 'isList'
> | null;

export type K8sWatchHookProps = Pick<WatchK8sResource, 'name' | 'namespace' | 'isList'> | null;
