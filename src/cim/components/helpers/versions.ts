import uniqBy from 'lodash/uniqBy';
import { AgentClusterInstallK8sResource, ClusterImageSetK8sResource } from '../../types';
import { OpenshiftVersionOptionType, OpenshiftVersion } from '../../../common';

export const getVersionFromReleaseImage = (releaseImage = '') => {
  const releaseImageParts = releaseImage.split(':');
  return (releaseImageParts[releaseImageParts.length - 1] || '').split('-')[0];
};

// eslint-disable-next-line
const getSupportLevelFromChannel = (
  channel?: string,
): OpenshiftVersion['supportLevel'] | 'custom' => {
  if (!channel) {
    return 'maintenance';
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
    .map((clusterImageSet): OpenshiftVersionOptionType => {
      const version = getVersionFromReleaseImage(clusterImageSet.spec?.releaseImage);
      return {
        label: version ? `OpenShift ${version}` : (clusterImageSet.metadata?.name as string),
        version: version || clusterImageSet.metadata?.name || '',
        value: clusterImageSet.metadata?.name as string,
        default: false,
        // (rawagner) ACM does not have the warning so changing to 'production'
        supportLevel: 'production', // getSupportLevelFromChannel(clusterImageSet.metadata?.labels?.channel),
      };
    })
    .sort(
      (versionA, versionB) => /* descending */ -1 * versionA.label.localeCompare(versionB.label),
    );

  if (versions.length) {
    // make sure that the pre-selected one is the first-one after sorting
    versions[0].default = true;
  }
  const deduped = uniqBy(versions, (v) => v.version);
  return deduped;
};

export const getSelectedVersion = (
  clusterImages: ClusterImageSetK8sResource[],
  agentClusterInstall: AgentClusterInstallK8sResource,
) => {
  const selectedClusterImage = clusterImages.find(
    (ci) => ci.metadata?.name === agentClusterInstall?.spec?.imageSetRef?.name,
  );
  return selectedClusterImage
    ? getOCPVersions([selectedClusterImage])?.[0]?.version
    : agentClusterInstall?.spec?.imageSetRef?.name;
};
