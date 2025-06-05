import uniqBy from 'lodash-es/uniqBy.js';

import {
  AgentClusterInstallK8sResource,
  ClusterImageSetK8sResource,
  ClusterVersionK8sResource,
} from '../../types';
import { OpenshiftVersionOptionType } from '../../../common';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';

export const getVersionFromReleaseImage = (releaseImage = '') => {
  const match = /.+:(\d+\.\d+(?:\.\d+)?(?:-\w+)?)/gm.exec(releaseImage);
  if (match && match.length > 1 && match[1]) {
    return match[1];
  }
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

export const supportedNutanixPlatforms = ['x86_64', 'x86-64'];

export const isValidImageSet = (cis: ClusterImageSetK8sResource, architectures?: string[]) => {
  if (cis.metadata?.labels?.visible !== 'true') {
    return false;
  }
  if (!architectures) {
    return true;
  }
  return architectures.some(
    (arch) => cis.spec?.releaseImage.endsWith(arch) || cis.metadata?.labels?.architecture === arch,
  );
};

export const getOCPVersions = (
  clusterImageSets: ClusterImageSetK8sResource[],
  isNutanix?: boolean | undefined,
): OpenshiftVersionOptionType[] => {
  const versions = clusterImageSets
    .filter((clusterImageSet) =>
      isValidImageSet(clusterImageSet, isNutanix ? supportedNutanixPlatforms : undefined),
    )
    .map((clusterImageSet): OpenshiftVersionOptionType => {
      const version = getVersionFromReleaseImage(clusterImageSet.spec?.releaseImage);
      return {
        label: `OpenShift ${version ? version : (clusterImageSet.metadata?.name as string)}`,
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

export const getCurrentClusterVersion = (cv?: ClusterVersionK8sResource): string | undefined =>
  cv?.status?.history?.[0]?.version || cv?.spec?.desiredUpdate?.version;

export const getMajorMinorVersion = (version = '') => {
  const match = /[0-9].[0-9][0-9]?/g.exec(version);
  return match?.[0] || '';
};

export const getNetworkType = (
  ocpVersion: OpenshiftVersionOptionType | undefined,
): 'OVNKubernetes' | 'OpenShiftSDN' =>
  parseFloat(getMajorMinorVersion(ocpVersion?.version)) >= 4.12 ? 'OVNKubernetes' : 'OpenShiftSDN';
