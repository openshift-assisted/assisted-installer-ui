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
  const match = /.+:(\d+\.\d+(?:\.\d+)?(?:-\w+)?)/gm.exec(releaseImage);
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

// Extracts major.minor version, strips any non-numeric prefix (e.g., "img4.18.55" → "4.18")
const extractMajorMinor = (version: string): string => {
  const versionWithoutPrefix = version.replace(/^[^\d]*/, '');
  return versionWithoutPrefix.split('.').slice(0, 2).join('.');
};

// Converts a ClusterImageSet to an OpenshiftVersionOptionType
const toVersionOption = (
  clusterImageSet: ClusterImageSetK8sResource,
): OpenshiftVersionOptionType => {
  const version =
    getVersionFromReleaseImage(clusterImageSet.spec?.releaseImage) ||
    clusterImageSet.metadata?.name ||
    '';
  const cpuArch = getCPUArchFromReleaseImage(clusterImageSet.spec?.releaseImage);
  return {
    label: `OpenShift ${version}`,
    version,
    value: clusterImageSet.metadata?.name as string,
    default: false,
    // (rawagner) ACM does not have the warning so changing to 'production'
    // supportLevel : getSupportLevelFromChannel(clusterImageSet.metadata?.labels?.channel)
    supportLevel: 'production',
    cpuArchitectures: cpuArch ? [cpuArch as CpuArchitecture] : undefined,
  };
};

/**
 * In case there are osImages specified on the AgentServiceConfig, we want to limit
 * the availability in the dropdown to only versions that are listed there.
 * Otherwise the installation fails.
 */
const hasMatchingOsImage = (
  version: OpenshiftVersionOptionType,
  osImageVersions: (string | undefined)[],
): boolean => {
  if (!osImageVersions.length) return true;
  return osImageVersions.includes(extractMajorMinor(version.version));
};

export const getOCPVersions = (
  clusterImageSets: ClusterImageSetK8sResource[],
  isNutanix?: boolean,
  osImages?: OsImage[],
  extended?: boolean,
): OpenshiftVersionOptionType[] => {
  const architectures = isNutanix ? supportedNutanixPlatforms : undefined;
  const osImageVersions = [...new Set(osImages?.map((img) => img.openshiftVersion))];

  const versions = clusterImageSets
    .filter((clusterImageSet) => isValidImageSet(clusterImageSet, architectures, extended))
    .map(toVersionOption)
    .filter((v) => hasMatchingOsImage(v, osImageVersions))
    .sort((a, b) => b.label.localeCompare(a.label));

  // Mark first version as the default selection
  versions[0] && (versions[0].default = true);

  return uniqBy(versions, (v) => v.version);
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
