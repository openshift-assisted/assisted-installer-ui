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
      enableOn: DiskEncryptionService.diskEncryptionEnableOn(
        values.enableDiskEncryptionOnMasters,
        values.enableDiskEncryptionOnWorkers,
      ),
      tangServers:
        values.diskEncryptionTangServers.length >= 1
          ? JSON.stringify(values.diskEncryptionTangServers)
          : JSON.stringify([
              {
                url: '',
                thumbprint: '',
              },
            ]),
    };
  },
};

export default DiskEncryptionService;
