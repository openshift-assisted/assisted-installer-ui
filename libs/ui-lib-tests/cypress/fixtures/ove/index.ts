import { bundles, supported_operators } from '../cluster/base-cluster';
import { hostDiscoveredBuilder } from '../create-sno/3-host-discovered';
import { hostRenamedBuilder } from '../create-sno/4-host-renamed';
import { clusterReadyBuilder } from '../create-sno/5-cluster-ready';
import { oveInfraEnv } from '../infra-envs';
import { oveCluster } from './1-cluster-created';
import { oveBoundHosts, oveReadyHosts, oveRenamedHosts, oveUnboundHosts } from './hosts';

const oveHostDiscoveredCluster = () => hostDiscoveredBuilder(oveCluster);
const oveHostRenamedCluster = () => hostRenamedBuilder(oveHostDiscoveredCluster());
const readyToInstallCluster = clusterReadyBuilder(oveHostRenamedCluster());

const createOveMultinodeFixtureMapping = {
  clusters: {
    default: oveCluster,
    HOST_DISCOVERED_3: oveHostDiscoveredCluster(),
    HOST_RENAMED_3: oveHostRenamedCluster(),
    READY_TO_INSTALL: readyToInstallCluster,
    ONLY_DUMMY_CUSTOM_MANIFEST_ADDED: readyToInstallCluster,
  },
  hosts: {
    default: [],
    HOST_DISCOVERED_3: oveBoundHosts,
    HOST_RENAMED_3: oveRenamedHosts,
    READY_TO_INSTALL: oveReadyHosts,
    ONLY_DUMMY_CUSTOM_MANIFEST_ADDED: oveReadyHosts,
  },
  bundles: bundles,
  supported_operators: supported_operators,
  infraEnvs: {
    default: oveInfraEnv,
  },
  manifests: [
    { file_name: 'system_manifest.yaml', folder: 'manifests', manifest_source: 'system' },
  ],
  manifestContent: '',
};

export { createOveMultinodeFixtureMapping, oveBoundHosts, oveUnboundHosts };
