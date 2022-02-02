import { isSNO } from '../../selectors';
import Day2ClusterService from '../../services/Day2ClusterService';
import { OcmClusterType } from './types';

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (Day2ClusterService.getOpenshiftClusterId(cluster)) {
    if (cluster.aiCluster) {
      if (!isSNO(cluster.aiCluster)) {
        return cluster.aiCluster.status === 'installed';
      }
    } else {
      return (
        cluster.state === 'ready' &&
        cluster.product?.id === 'OCP-AssistedInstall' &&
        cluster.cloud_provider?.id === 'baremetal' &&
        cluster.metrics?.nodes?.total &&
        cluster.metrics?.nodes?.total > 1
      );
    }
  }

  return false;
};
