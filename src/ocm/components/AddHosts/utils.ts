import { isSNO } from '../../../common';
import Day2ClusterService from '../../services/Day2ClusterService';
import { getFeatureSupported } from '../featureSupportLevels/FeatureSupportLevelProvider';
import { OcmClusterType } from './types';

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (Day2ClusterService.getOpenshiftClusterId(cluster)) {
    if (cluster.aiCluster) {
      if (isSNO(cluster.aiCluster)) {
        return (
          cluster.aiCluster.status === 'installed' &&
          cluster.aiCluster.openshiftVersion &&
          getFeatureSupported(
            cluster.aiCluster.openshiftVersion || '',
            cluster.aiSupportLevels || [],
            'SINGLE_NODE_EXPANSION',
          )
        );
      } else {
        return cluster.aiCluster.status === 'installed';
      }
    } else {
      return (
        cluster.state === 'ready' &&
        cluster.product?.id === 'OCP-AssistedInstall' &&
        ((cluster.metrics?.nodes?.total && cluster.metrics?.nodes?.total > 1) ||
          getFeatureSupported(
            cluster.openshift_version,
            cluster.aiSupportLevels || [],
            'SINGLE_NODE_EXPANSION',
          ))
      );
    }
  }

  return false;
};
