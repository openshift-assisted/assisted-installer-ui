import { multinodeCluster } from './1-cluster-created';
import { isoDownloadedClusterBuilder } from '../create-sno/2-iso-downloaded';
import { hostDiscoveredBuilder } from '../create-sno/3-host-discovered';
import { hostRenamedBuilder } from '../create-sno/4-host-renamed';
import { clusterReadyBuilder } from '../create-sno/5-cluster-ready';

const isoDownloadedCluster = isoDownloadedClusterBuilder(multinodeCluster);
const hostDiscoveredCluster = () => hostDiscoveredBuilder(isoDownloadedCluster);
const hostRenamedCluster = () => hostRenamedBuilder(hostDiscoveredCluster());
const readyToInstallCluster = clusterReadyBuilder(hostRenamedCluster());

const createMultinodeFixtureMapping = {
  clusters: {
    ISO_DOWNLOADED: isoDownloadedCluster,
    HOST_DISCOVERED_1: hostDiscoveredCluster(),
    HOST_DISCOVERED_2: hostDiscoveredCluster(),
    HOST_DISCOVERED_3: hostDiscoveredCluster(),
    HOST_RENAMED_1: hostRenamedCluster(),
    HOST_RENAMED_2: hostRenamedCluster(),
    HOST_RENAMED_3: hostRenamedCluster(),
    READY_TO_INSTALL: readyToInstallCluster,
    default: multinodeCluster,
  },
};

export default createMultinodeFixtureMapping;
