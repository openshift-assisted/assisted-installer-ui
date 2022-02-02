import { isSNO } from '../../selectors';
import Day2ClusterService from '../../services/Day2ClusterService';
import { OcmClusterType } from './types';

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (Day2ClusterService.getOpenshiftClusterId(cluster)) {
    if (
      cluster.aiCluster &&
      cluster.aiCluster.status === 'installed' &&
      !isSNO(cluster.aiCluster)
    ) {
      return true;
    } else if (
      (cluster.state === 'ready' && cluster.product?.id == 'OCP-AssistedInstaller') ||
      cluster.cloud_provider?.id === 'baremetal'
    ) {
      return true;
    }
  }

  return false;
};
