import { Cluster } from '@openshift-assisted/types/./assisted-installer-service';
import { NETWORK_TYPE_OVN, NETWORK_TYPE_SDN } from '../../common/config';

export const isOciPlatformType = (cluster: Cluster): boolean => {
  return (
    cluster.platform?.type === 'external' && cluster.platform?.external?.platformName === 'oci'
  );
};

export const isExternalPlatform = (cluster: Cluster): boolean => {
  return cluster.platform?.type === 'external';
};

export const isThirdPartyCNI = (networkType: Cluster['networkType']): boolean =>
  !!networkType && networkType !== NETWORK_TYPE_OVN && networkType !== NETWORK_TYPE_SDN;
