import { isSNO } from '../../../common';
import { canAddHostSNO } from '../../../common/utils';
import Day2ClusterService from '../../services/Day2ClusterService';
import { OcmClusterType } from './types';

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (Day2ClusterService.getOpenshiftClusterId(cluster)) {
    if (cluster.aiCluster) {
      if (isSNO(cluster.aiCluster)) {
        return (
          cluster.aiCluster.status === 'installed' &&
          canAddHostSNO(cluster.aiCluster?.openshiftVersion || cluster.openshift_version)
        );
      } else {
        return cluster.aiCluster.status === 'installed';
      }
    } else {
      return (
        cluster.state === 'ready' &&
        cluster.product?.id === 'OCP-AssistedInstall' &&
        ((cluster.metrics?.nodes?.total && cluster.metrics?.nodes?.total > 1) ||
          canAddHostSNO(cluster.openshift_version))
      );
    }
  }

  return false;
};
