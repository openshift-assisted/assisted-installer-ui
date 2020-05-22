import { ClusterCreateParams } from '../api/types';

type OpenshiftVersionOptionType = {
  label: string;
  value: ClusterCreateParams['openshiftVersion'];
};

export const OPENSHIFT_VERSION_OPTIONS: OpenshiftVersionOptionType[] = [
  { label: 'OpenShift 4.4', value: '4.4' },
  // { label: 'OpenShift 4.5', value: '4.5' },
  // { label: 'OpenShift 4.6', value: '4.6' },
];

export const CLUSTER_MANAGER_SITE_LINK =
  'https://cloud.redhat.com/openshift/install/metal/user-provisioned';

export const POLLING_INTERVAL = 10000;

export const HOST_ROLES = ['worker', 'master'];
// Without undefined. Otherwise must conform generated Host['roles'] - see api/types.ts
export type HostRolesType = 'master' | 'worker';
