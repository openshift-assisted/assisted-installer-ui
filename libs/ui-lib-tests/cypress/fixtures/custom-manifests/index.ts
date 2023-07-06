import { customManifestsCluster } from './1-cluster-created';
import { clusterReadyBuilder } from '../create-sno/5-cluster-ready';
import { isoDownloadedClusterBuilder } from '../create-sno/2-iso-downloaded';
import { hostDiscoveredBuilder } from '../create-sno/3-host-discovered';
import { hostRenamedBuilder } from '../create-sno/4-host-renamed';
import { customManifests, customManifestContent } from './manifests';

const isoDownloadedCluster = isoDownloadedClusterBuilder(customManifestsCluster);
const hostDiscoveredCluster = hostDiscoveredBuilder(isoDownloadedCluster);
const hostRenamedCluster = hostRenamedBuilder(hostDiscoveredCluster);
const readyToInstallCluster = clusterReadyBuilder(hostRenamedCluster);

const createCustomManifestsFixtureMapping = {
  clusters: {
    READY_TO_INSTALL: readyToInstallCluster,
    default: customManifestsCluster,
  },
  manifests: customManifests,
  manifestContent: customManifestContent,
};

export default createCustomManifestsFixtureMapping;
