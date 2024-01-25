import { Cluster } from '@openshift-assisted/types/./assisted-installer-service';

export const isOciPlatformType = (cluster: Cluster): boolean => {
  return (
    cluster.platform?.type === 'external' && cluster.platform?.external?.platformName === 'oci'
  );
};

export const getMajorMinorVersion = (version = '') => {
  const match = /[0-9].[0-9][0-9]?/g.exec(version);
  return match?.[0] || '';
};

export const isOCPVersionEqualsOrMajor = (
  openshiftVersion: string,
  ocpVersionToCompare: string,
): boolean => {
  return parseFloat(getMajorMinorVersion(openshiftVersion)) >= parseFloat(ocpVersionToCompare);
};
