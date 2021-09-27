import { OpenshiftVersionOptionType, OpenshiftVersion } from '../../../common';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';

export const getSimplifiedImageName = (releaseImage = '') => {
  const match = /.+:(.*)-/gm.exec(releaseImage);
  if (match && match[1]) {
    return `OpenShift ${match[1]}`;
  }
};

const getSupportLevelFromChannel = (channel?: string): OpenshiftVersion['supportLevel'] => {
  if (!channel) {
    return 'custom';
  }

  if (channel.startsWith('fast')) {
    return 'beta'; // TODO(mlibra): Is this correct?
  }

  if (channel.startsWith('stable')) {
    return 'production';
  }

  return 'beta';
};

export const getOCPVersions = (
  clusterImageSets: ClusterImageSetK8sResource[],
): OpenshiftVersionOptionType[] => {
  const versions = clusterImageSets
    .filter((clusterImageSet) => clusterImageSet.metadata?.labels?.visible !== 'false')
    .map(
      (clusterImageSet): OpenshiftVersionOptionType => ({
        label:
          getSimplifiedImageName(clusterImageSet.spec?.releaseImage) ||
          (clusterImageSet.metadata?.name as string),
        value: clusterImageSet.metadata?.name as string,
        default: false,
        supportLevel: getSupportLevelFromChannel(clusterImageSet.metadata?.labels?.channel),
      }),
    )
    .sort(
      (versionA, versionB) => /* descending */ -1 * versionA.label.localeCompare(versionB.label),
    );

  if (versions.length) {
    // make sure that the pre-selected one is the first-one after sorting
    versions[0].default = true;
  }

  return versions;
};
