import { bundles, supported_operators } from '../cluster/base-cluster';
import { hostDiscoveredBuilder } from '../create-sno/3-host-discovered';
import { hostRenamedBuilder } from '../create-sno/4-host-renamed';
import { oveInfraEnv } from '../infra-envs';
import { oveCluster } from './1-cluster-created';
import { oveBoundHosts, oveRenamedHosts, oveUnboundHosts } from './hosts';

const oveHostDiscoveredCluster = () => hostDiscoveredBuilder(oveCluster);
const oveHostRenamedCluster = () => hostRenamedBuilder(oveHostDiscoveredCluster());

const createOveMultinodeFixtureMapping = {
  clusters: {
    default: oveCluster,
    HOST_DISCOVERED_3: oveHostDiscoveredCluster(),
    HOST_RENAMED_3: oveHostRenamedCluster(),
  },
  hosts: {
    default: [],
    HOST_DISCOVERED_3: oveBoundHosts,
    HOST_RENAMED_3: oveRenamedHosts,
  },
  bundles: bundles,
  supported_operators: supported_operators,
  infraEnvs: {
    default: oveInfraEnv,
  },
};

export { createOveMultinodeFixtureMapping, oveBoundHosts, oveUnboundHosts };
