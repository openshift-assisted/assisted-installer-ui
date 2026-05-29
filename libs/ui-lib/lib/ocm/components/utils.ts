import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const isOciPlatformType = (cluster: Cluster): boolean => {
  return (
    cluster.platform?.type === 'external' && cluster.platform?.external?.platformName === 'oci'
  );
};
