import { bundles, supported_operators } from '../cluster/base-cluster';
import { hostDiscoveredBuilder } from '../create-sno/3-host-discovered';
import { hostRenamedBuilder } from '../create-sno/4-host-renamed';
import { clusterReadyBuilder } from '../create-sno/5-cluster-ready';
import {
  clusterInstallingBuilder,
  clusterPreparingForInstallationBuilder,
} from '../create-sno/6-cluster-installing';
import { sshKey } from '../data';
import { oveInfraEnv } from '../infra-envs';
import { dualstackClusterBase, withDualStackNetworks } from '../dualstack/1-network-ready';
import { clusterReadyBuilder as dualstackClusterReadyBuilder } from '../dualstack/5-cluster-ready';
import { oveCluster, oveMultinode } from './1-cluster-created';
import {
  oveBoundHosts,
  oveBoundSNOHost,
  oveInstallingHosts,
  ovePreparingHosts,
  oveReadyHosts,
  oveReadySNOHost,
  oveRenamedHosts,
  oveRenamedSNOHost,
  oveUnboundHosts,
  oveUnboundSNOHost,
} from './hosts';

const oveHostDiscoveredCluster = (cluster) => hostDiscoveredBuilder(cluster);
const oveHostRenamedCluster = (cluster) => hostRenamedBuilder(oveHostDiscoveredCluster(cluster));
const readyToInstallCluster = (cluster) => clusterReadyBuilder(oveHostRenamedCluster(cluster));

const createOveMultinodeFixtureMapping = {
  clusters: {
    default: oveMultinode,
    HOST_DISCOVERED_3: oveHostDiscoveredCluster(oveMultinode),
    HOST_RENAMED_3: oveHostRenamedCluster(oveMultinode),
    READY_TO_INSTALL: readyToInstallCluster(oveMultinode),
    ONLY_DUMMY_CUSTOM_MANIFEST_ADDED: readyToInstallCluster(oveMultinode),
    CLUSTER_PREPARING_FOR_INSTALLATION: clusterPreparingForInstallationBuilder(
      readyToInstallCluster(oveMultinode),
    ),
    CLUSTER_INSTALLING: clusterInstallingBuilder(readyToInstallCluster(oveMultinode)),
  },
  hosts: {
    default: [],
    HOST_DISCOVERED_3: oveBoundHosts,
    HOST_RENAMED_3: oveRenamedHosts,
    READY_TO_INSTALL: oveReadyHosts,
    ONLY_DUMMY_CUSTOM_MANIFEST_ADDED: oveReadyHosts,
    CLUSTER_PREPARING_FOR_INSTALLATION: ovePreparingHosts,
    CLUSTER_INSTALLING: oveInstallingHosts,
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

// SNO

const createOveSinglenodeFixtureMapping = {
  clusters: {
    default: oveCluster,
    HOST_DISCOVERED_1: oveHostDiscoveredCluster(oveCluster),
    HOST_RENAMED_1: oveHostRenamedCluster(oveCluster),
    READY_TO_INSTALL: readyToInstallCluster(oveCluster),
    ONLY_DUMMY_CUSTOM_MANIFEST_ADDED: readyToInstallCluster(oveCluster),
    CLUSTER_PREPARING_FOR_INSTALLATION: clusterPreparingForInstallationBuilder(
      readyToInstallCluster(oveCluster),
    ),
    CLUSTER_INSTALLING: clusterInstallingBuilder(readyToInstallCluster(oveCluster)),
  },
  hosts: {
    default: [],
    HOST_DISCOVERED_1: oveBoundSNOHost,
    HOST_RENAMED_1: oveRenamedSNOHost,
    READY_TO_INSTALL: oveReadySNOHost,
    ONLY_DUMMY_CUSTOM_MANIFEST_ADDED: oveReadySNOHost,
  },
  bundles: bundles,
  supported_operators: supported_operators,
  infraEnvs: {
    default: { ...oveInfraEnv, ssh_authorized_key: sshKey },
  },
  manifests: [
    { file_name: 'system_manifest.yaml', folder: 'manifests', manifest_source: 'system' },
  ],
  manifestContent: '',
};

// Dualstack

const oveDualstackBase = {
  ...dualstackClusterBase,
  name: 'ai-ove-dualstack',
  network_type: 'OVNKubernetes',
};
const oveDualstackSelected = withDualStackNetworks(oveDualstackBase);

const createOveDualstackFixtureMapping = {
  clusters: {
    NETWORKING_DUAL_STACK_DISCOVERED: oveDualstackBase,
    NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK: oveDualstackBase,
    NETWORKING_DUAL_STACK_SELECT_DUAL_STACK: oveDualstackSelected,
    READY_TO_INSTALL: dualstackClusterReadyBuilder(oveDualstackSelected),
  },
  infraEnvs: {
    default: oveInfraEnv,
  },
};

export {
  createOveMultinodeFixtureMapping,
  createOveDualstackFixtureMapping,
  createOveSinglenodeFixtureMapping,
  oveBoundHosts,
  oveUnboundHosts,
  oveBoundSNOHost,
  oveUnboundSNOHost,
};
