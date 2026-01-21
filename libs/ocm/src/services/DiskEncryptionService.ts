import { ClusterDetailsValues } from '@openshift-assisted/common';
import {
  ClusterCreateParams,
  DiskEncryption,
} from '@openshift-assisted/types/assisted-installer-service';

const DiskEncryptionService = {
  diskEncryptionEnableOn(
    isEnableOnMasters: boolean,
    isEnableOnWorkers: boolean,
    isEnableOnArbiters: boolean,
  ): DiskEncryption['enableOn'] {
    let enableOnParam: DiskEncryption['enableOn'];
    if (isEnableOnMasters && isEnableOnWorkers && isEnableOnArbiters) enableOnParam = 'all';
    else if (isEnableOnMasters && isEnableOnWorkers) enableOnParam = 'masters,workers';
    else if (isEnableOnMasters && isEnableOnArbiters) enableOnParam = 'masters,arbiters';
    else if (isEnableOnWorkers && isEnableOnArbiters) enableOnParam = 'arbiters,workers';
    else if (isEnableOnArbiters) enableOnParam = 'arbiters';
    else if (isEnableOnWorkers) enableOnParam = 'workers';
    else if (isEnableOnMasters) enableOnParam = 'masters';
    else enableOnParam = 'none';
    return enableOnParam;
  },

  getDiskEncryptionParams(values: ClusterDetailsValues): ClusterCreateParams['diskEncryption'] {
    return {
      mode: values.diskEncryptionMode,
      enableOn:
        values.controlPlaneCount === 1
          ? values.enableDiskEncryptionOnMasters
            ? 'all'
            : 'none'
          : DiskEncryptionService.diskEncryptionEnableOn(
              values.enableDiskEncryptionOnMasters,
              values.enableDiskEncryptionOnWorkers,
              values.enableDiskEncryptionOnArbiters,
            ),
      tangServers:
        values.diskEncryptionMode === 'tang'
          ? JSON.stringify(values.diskEncryptionTangServers)
          : undefined,
    };
  },
};

export default DiskEncryptionService;
