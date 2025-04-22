import uniqBy from 'lodash-es/uniqBy.js';

import {
  AgentClusterInstallK8sResource,
  ClusterImageSetK8sResource,
  ClusterVersionK8sResource,
  OsImage,
} from '../../types';
import { CpuArchitecture, OpenshiftVersionOptionType } from '../../../common';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import { getMajorMinorVersion } from '../../../common/utils';

export const getVersionFromReleaseImage = (releaseImage = '') => {
  const match = /.+:(.*)/gm.exec(releaseImage);
  if (match && match.length > 1 && match[1]) {
    return match[1];
  }
};

const getCPUArchFromReleaseImage = (releaseImage = '') => {
  const match = /.+:.*-(.*)/gm.exec(releaseImage);
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

export const isValidImageSet = (
  cis: ClusterImageSetK8sResource,
  architectures?: string[],
  extended?: boolean,
) => {
  if (!extended && cis.metadata?.labels?.visible !== 'true') {
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
  osImages?: OsImage[],
  extended?: boolean,
): OpenshiftVersionOptionType[] => {
  const ocpImageVersions = Array.from(
    new Set(osImages?.map((osImage) => osImage.openshiftVersion)),
  );

  const versions = clusterImageSets
    .filter((clusterImageSet) =>
      isValidImageSet(clusterImageSet, isNutanix ? supportedNutanixPlatforms : undefined, extended),
    )
    .map((clusterImageSet): OpenshiftVersionOptionType => {
      const version = getVersionFromReleaseImage(clusterImageSet.spec?.releaseImage);
      const cpuArch = getCPUArchFromReleaseImage(clusterImageSet.spec?.releaseImage);
      return {
        label: `OpenShift ${version ? version : (clusterImageSet.metadata?.name as string)}`,
        version: version || clusterImageSet.metadata?.name || '',
        value: clusterImageSet.metadata?.name as string,
        default: false,
        // (rawagner) ACM does not have the warning so changing to 'production'
        supportLevel: 'production', // getSupportLevelFromChannel(clusterImageSet.metadata?.labels?.channel),
        cpuArchitectures: cpuArch ? [cpuArch as CpuArchitecture] : undefined,
      };
    })
    .filter((ocpVersion) => {
      const ver = ocpVersion.version.split('.').slice(0, 2).join('.');
      return !!ocpImageVersions.length ? ocpImageVersions.includes(ver) : true;
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
    ? getOCPVersions([selectedClusterImage], undefined, undefined, true)?.[0]?.version
    : agentClusterInstall?.spec?.imageSetRef?.name;
};

export const getCurrentClusterVersion = (cv?: ClusterVersionK8sResource): string | undefined =>
  cv?.status?.history?.[0]?.version || cv?.spec?.desiredUpdate?.version;

export const getNetworkType = (
  ocpVersion: OpenshiftVersionOptionType | undefined,
): 'OVNKubernetes' | 'OpenShiftSDN' =>
  parseFloat(getMajorMinorVersion(ocpVersion?.version)) >= 4.12 ? 'OVNKubernetes' : 'OpenShiftSDN';
