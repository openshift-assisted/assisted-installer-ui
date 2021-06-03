import { OcmClusterType } from './types';

export const getOpenshiftClusterId = (ocmCluster?: OcmClusterType) =>
  ocmCluster && ocmCluster.external_id;

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (getOpenshiftClusterId(cluster)) {
    // Collision of "ready" states for AI and Telemetry
    // Show the tab only if telemetry reports "ready", not the AI
    if (
      cluster.product?.id === 'OCP-AssistedInstall' &&
      cluster.state === 'ready' &&
      (!cluster.aiCluster || cluster.aiCluster.status === 'installed')
    ) {
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
