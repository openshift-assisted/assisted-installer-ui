import { OcmClusterType } from './types';

export const getOpenshiftClusterId = (ocmCluster?: OcmClusterType) =>
  ocmCluster && ocmCluster.external_id;

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (getOpenshiftClusterId(cluster)) {
    if (cluster.product?.id === 'OCP-AssistedInstall' && cluster.state === 'installed') {
      // TODO(mlibra): Review that "installed" state once we start getting cluster state from metrics
      return true;
    }
    if (
      cluster.product?.id !== 'OCP-AssistedInstall' &&
      cluster.cloud_provider?.id === 'baremetal' &&
      cluster.state === 'ready'
    ) {
      // Backward compatibility for old AI clusters (when the subscription was created by the telemetry instead of by the AI-Service)
      return true;
    }
  }
  return false;
};
