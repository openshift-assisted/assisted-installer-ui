import { ClusterCreateParams, ClusterDetailsValues, DiskEncryption } from '../../common';

const DiskEncryptionService = {
  diskEncryptionEnableOn(
    isEnableOnMasters: boolean,
    isEnableOnWorkers: boolean,
  ): DiskEncryption['enableOn'] {
    let enableOnParam: DiskEncryption['enableOn'];
    if (isEnableOnMasters && isEnableOnWorkers) enableOnParam = 'all';
    else if (isEnableOnWorkers) enableOnParam = 'workers';
    else if (isEnableOnMasters) enableOnParam = 'masters';
    else enableOnParam = 'none';
    return enableOnParam;
  },

  getDiskEncryptionParams(values: ClusterDetailsValues): ClusterCreateParams['diskEncryption'] {
    return {
      mode: values.diskEncryptionMode,
      enableOn:
        values.highAvailabilityMode === 'None'
          ? values.enableDiskEncryptionOnMasters
            ? 'all'
            : 'none'
          : DiskEncryptionService.diskEncryptionEnableOn(
              values.enableDiskEncryptionOnMasters,
              values.enableDiskEncryptionOnWorkers,
            ),
      tangServers:
        values.diskEncryptionMode === 'tang'
          ? JSON.stringify(values.diskEncryptionTangServers)
          : undefined,
    };
  },
};

export default DiskEncryptionService;
