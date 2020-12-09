import { OcmClusterType } from './types';

export const getOpenshiftClusterId = (ocmCluster?: OcmClusterType) =>
  ocmCluster && ocmCluster.external_id;

export const canAddBareMetalHost = ({ cluster }: { cluster: OcmClusterType }) =>
  cluster.state === 'ready' &&
  !!getOpenshiftClusterId(cluster) &&
  cluster.cloud_provider?.id === 'baremetal';
