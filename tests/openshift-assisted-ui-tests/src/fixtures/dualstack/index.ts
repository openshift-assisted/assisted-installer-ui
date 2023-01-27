/* eslint-disable @typescript-eslint/naming-convention */
import { dualstackClusterBase, withDualStackNetworks } from './1-network-ready';
import { clusterReadyBuilder } from './5-cluster-ready';

const dualStackSelectedCluster = withDualStackNetworks(dualstackClusterBase);
const readyToInstallCluster = clusterReadyBuilder(dualStackSelectedCluster);

const createDualStackFixtureMapping = {
  NETWORKING_DUAL_STACK_DISCOVERED: dualstackClusterBase,
  NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK: dualstackClusterBase,
  NETWORKING_DUAL_STACK_SELECT_DUAL_STACK: dualStackSelectedCluster,
  READY_TO_INSTALL: readyToInstallCluster,
};

export { createDualStackFixtureMapping };
