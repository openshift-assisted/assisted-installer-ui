import storageCluster from './storage-cluster';
import storageHosts from './storage-hosts';

const createStorageFixtureMapping = {
  default: storageCluster,
  staticHosts: storageHosts,
};

export default createStorageFixtureMapping;
