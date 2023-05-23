import storageCluster from './storage-cluster';
import storageHosts from './storage-hosts';

const createStorageFixtureMapping = {
  clusters: {
    default: storageCluster,
  },
  hosts: {
    default: storageHosts,
  },
};

export default createStorageFixtureMapping;
