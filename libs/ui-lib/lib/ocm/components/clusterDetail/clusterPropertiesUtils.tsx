import React from 'react';
import { isDualStack, NETWORK_TYPE_SDN } from '../../../common';
import { Cluster, DiskEncryption } from '@openshift-assisted/types/assisted-installer-service';

export const getNetworkType = (clusterNetworkType: Cluster['networkType']): string => {
  let networkType: string;
  clusterNetworkType === NETWORK_TYPE_SDN
    ? (networkType = 'Software-Defined Networking (SDN)')
    : (networkType = 'Open Virtual Network (OVN)');
  return networkType;
};

export const getManagementType = ({ userManagedNetworking }: Cluster): string => {
  let managementType: string;
  userManagedNetworking
    ? (managementType = 'User-Managed Networking')
    : (managementType = 'Cluster-managed networking');
  return managementType;
};

export const getStackTypeLabel = (cluster: Cluster): string =>
  isDualStack(cluster) ? 'Dual-stack' : 'IPv4';

export const getDiskEncryptionEnabledOnStatus = (diskEncryption: DiskEncryption['enableOn']) => {
  let diskEncryptionType = null;
  switch (diskEncryption) {
    case 'all':
      diskEncryptionType = (
        <>
          Enabled on control plane nodes
          <br />
          Enabled on workers
        </>
      );
      break;
    case 'masters':
      diskEncryptionType = <>Enabled on control plane nodes</>;
      break;
    case 'workers':
      diskEncryptionType = <>Enabled on workers</>;
      break;
  }
  return diskEncryptionType;
};
