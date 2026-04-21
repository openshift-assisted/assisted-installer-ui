import uniqBy from 'lodash-es/uniqBy.js';

import {
  AgentClusterInstallK8sResource,
  ClusterImageSetK8sResource,
  ClusterVersionK8sResource,
  OsImage,
} from '../../types';
import { CpuArchitecture, OpenshiftVersionOptionType } from '../../../common';
import { getComparableVersionInt } from '../../../common/utils';

export const getVersionFromReleaseString = (value = '') => {
  const match = /(\d+\.\d+(?:\.\d+)?(?:-\w+)?)/gm.exec(value);
  if (match && match.length > 1 && match[1]) {
    return match[1];
  }
};

export const getVersionFromClusterImageSet = (clusterImageSet?: ClusterImageSetK8sResource) => {
  return (
    getVersionFromReleaseString(clusterImageSet?.metadata?.labels?.['releaseTag']) ||
    getVersionFromReleaseString(clusterImageSet?.spec?.releaseImage) ||
    clusterImageSet?.metadata?.name ||
    ''
  );
};

const getCPUArchFromReleaseString = (value = '') => {
  const match = /(?:\d+\.)+\d+-(x86-64|[\w_]+)/gm.exec(value);
  if (match && match.length > 1 && match[1]) {
    return match[1];
  }
};

const getCPUArchFromClusterImageSet = (clusterImageSet?: ClusterImageSetK8sResource) => {
  const cpuArch =
    clusterImageSet?.metadata?.labels?.architecture ??
    getCPUArchFromReleaseString(clusterImageSet?.metadata?.labels?.['releaseTag']) ??
    getCPUArchFromReleaseString(clusterImageSet?.spec?.releaseImage) ??
    getCPUArchFromReleaseString(clusterImageSet?.metadata?.name) ??
    '';

  switch (cpuArch) {
    case CpuArchitecture.x86:
    case CpuArchitecture.ARM:
    case CpuArchitecture.s390x:
    case CpuArchitecture.MULTI:
      return cpuArch as CpuArchitecture;
    case 'x86-64':
      return CpuArchitecture.x86;
    default:
      return undefined;
  }
};

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
  const version = getVersionFromClusterImageSet(clusterImageSet);
  const cpuArch = getCPUArchFromClusterImageSet(clusterImageSet);

  return {
    label: `OpenShift ${version}`,
    version,
    value: clusterImageSet.metadata?.name as string,
    default: false,
    supportLevel: 'production', // ACM doesn't have feature support levels
    cpuArchitectures: cpuArch ? [cpuArch] : undefined,
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

const supportedNutanixPlatforms = ['x86_64', 'x86-64'];

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
): 'OVNKubernetes' | 'OpenShiftSDN' => {
  const checkVersionNum = getComparableVersionInt(ocpVersion?.version || '');
  const toVersionNum = getComparableVersionInt('4.12');

  return !checkVersionNum || checkVersionNum >= toVersionNum ? 'OVNKubernetes' : 'OpenShiftSDN';
};
