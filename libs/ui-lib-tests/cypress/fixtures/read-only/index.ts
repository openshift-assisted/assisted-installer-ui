import { bundles, readOnlyCluster, supported_operators } from './5-cluster-ready';

const createReadOnlyFixtureMapping = {
  clusters: {
    default: readOnlyCluster,
  },
  bundles: bundles,
  supported_operators: supported_operators,
};

export { createReadOnlyFixtureMapping };
