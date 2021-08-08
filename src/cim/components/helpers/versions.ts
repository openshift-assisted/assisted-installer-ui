import { OpenshiftVersionOptionType } from '../../../common';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';

export const getOCPVersions = (
  clusterImageSets: ClusterImageSetK8sResource[],
): OpenshiftVersionOptionType[] =>
  clusterImageSets.map((clusterImageSet, index) => ({
    label: clusterImageSet.metadata?.name as string,
    value: clusterImageSet.metadata?.name as string, // TODO(mlibra): probably wrong but what is expected here?
    default: index === 0,
    supportLevel: 'beta', // TODO(mlibra): Map from label "channel"
  }));
