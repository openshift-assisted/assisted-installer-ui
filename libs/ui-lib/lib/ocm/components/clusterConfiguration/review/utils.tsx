import { isDualStack } from '../../../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const getStackTypeLabel = (cluster: Cluster, isSingleClusterFeature = false): string => {
  if (isDualStack(cluster)) return 'Dual-stack';
  if (isSingleClusterFeature) return 'Single stack';
  return 'IPv4';
};
