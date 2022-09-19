import Day2ClusterService from '../../services/Day2ClusterService';
import { getFeatureSupported } from '../featureSupportLevels/FeatureSupportLevelProvider';
import { OcmClusterType } from './types';

const isSNOExpansionAllowed = (cluster: OcmClusterType) => {
  return getFeatureSupported(
    cluster.openshift_version,
    cluster.aiSupportLevels || [],
    'SINGLE_NODE_EXPANSION',
  );
};

export const canAddHost = ({ cluster }: { cluster: OcmClusterType }) => {
  if (!cluster.canEdit || !Day2ClusterService.getOpenshiftClusterId(cluster)) {
    return false;
  }

  const isMultiNode = (cluster.metrics?.nodes?.total || 0) > 1;
  return (
    cluster.state === 'ready' &&
    cluster.product?.id === 'OCP-AssistedInstall' &&
    (isMultiNode || isSNOExpansionAllowed(cluster))
  );
};
