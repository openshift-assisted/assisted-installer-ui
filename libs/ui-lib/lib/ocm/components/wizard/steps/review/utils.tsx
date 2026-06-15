import React from 'react';
import { isDualStack } from '../../../../../common';
import { Cluster, DiskEncryption } from '@openshift-assisted/types/assisted-installer-service';

export const getManagementType = ({ userManagedNetworking }: Cluster): string =>
  userManagedNetworking ? 'User-managed networking' : 'Cluster-managed networking';

export const getStackTypeLabel = (cluster: Cluster, isSingleClusterFeature = false): string => {
  if (isDualStack(cluster)) return 'Dual-stack';
  if (isSingleClusterFeature) return 'Single stack';
  return 'IPv4';
};

export const getDiskEncryptionEnabledOnStatus = (diskEncryption: DiskEncryption['enableOn']) => {
  let diskEncryptionType = null;
  switch (diskEncryption) {
    case undefined:
    case 'none':
      break;
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
    case 'arbiters':
      diskEncryptionType = <>Enabled on arbiters</>;
      break;
    case 'masters,arbiters':
      diskEncryptionType = <>Enabled on control plane nodes and arbiters</>;
      break;
    case 'masters,workers':
      diskEncryptionType = <>Enabled on control plane nodes and workers</>;
      break;
    case 'arbiters,workers':
      diskEncryptionType = <>Enabled on arbiters and workers</>;
      break;
    case 'masters,arbiters,workers':
      diskEncryptionType = (
        <>
          Enabled on control plane nodes
          <br />
          Enabled on arbiters
          <br />
          Enabled on workers
        </>
      );
      break;
    default: {
      const _exhaustive: never = diskEncryption;
      return _exhaustive;
    }
  }
  return diskEncryptionType;
};
