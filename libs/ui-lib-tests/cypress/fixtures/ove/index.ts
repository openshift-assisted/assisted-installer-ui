import { bundles, supported_operators } from '../cluster/base-cluster';
import { oveInfraEnv } from '../infra-envs';
import { oveCluster } from './1-cluster-created';

const createOveMultinodeFixtureMapping = {
  clusters: {
    default: oveCluster,
  },
  bundles: bundles,
  supported_operators: supported_operators,
  infraEnvs: {
    default: oveInfraEnv,
  },
};

export { createOveMultinodeFixtureMapping };
