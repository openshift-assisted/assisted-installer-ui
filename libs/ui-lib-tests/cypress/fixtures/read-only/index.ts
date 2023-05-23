import { readOnlyCluster } from './5-cluster-ready';

const createReadOnlyFixtureMapping = {
  clusters: {
    default: readOnlyCluster,
  },
};

export default createReadOnlyFixtureMapping;
