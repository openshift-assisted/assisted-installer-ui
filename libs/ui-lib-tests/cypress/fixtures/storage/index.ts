import storageCluster from './storage-cluster';
import { createMultinodeFixtureMapping } from '../create-mn';
import { storageHosts, hostsWithDiskHolders } from './storage-hosts';

const createStorageFixtureMapping = {
  clusters: {
    default: storageCluster,
  },
  hosts: {
    default: storageHosts,
  },
};

const createDiskHoldersFixtureMapping = {
  clusters: {
    default: createMultinodeFixtureMapping.clusters.READY_TO_INSTALL,
  },
  hosts: {
    default: hostsWithDiskHolders,
  },
};

export { createStorageFixtureMapping, createDiskHoldersFixtureMapping };
