import { OcmClusterType } from './types';

export const getOcmClusterId = (ocmCluster: OcmClusterType) => ocmCluster.external_id;

export const canAddBareMetalHost = ({ cluster }: { cluster: OcmClusterType }) =>
  cluster.state === 'ready' &&
  !!getOcmClusterId(cluster) &&
  cluster.cloud_provider?.id === 'baremetal';
