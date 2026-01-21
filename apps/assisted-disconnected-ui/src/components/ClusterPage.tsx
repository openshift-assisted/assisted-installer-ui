import * as React from 'react';
import { SingleClusterPage, Store } from '@openshift-assisted/ocm';
import { useParams } from 'react-router-dom-v5-compat';
import { ClustersAPI, getHostProgressStages, ResourceUIState } from '@openshift-assisted/common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

import ResetSingleClusterModal from './ResetSingleClusterModal';
import SingleClusterFinalizerPage from './SingleClusterFinalizerPage';

const currentClusterSelector = (state: Store.RootStateDay1) => state.currentCluster;

const useFinalizerPage = () => {
  const { uiState, data: cluster } = Store.useSelectorDay1(currentClusterSelector);
  const clusterRef = React.useRef<Cluster>();
  const [consoleUrl, setConsoleUrl] = React.useState<string>();

  React.useEffect(() => {
    // Fetch console URL for finalizer page.
    // We wont be able to do so after we render it, as backend will be already gone at the time.
    if (
      !consoleUrl &&
      cluster?.id &&
      ['installing', 'installing-pending-user-action'].includes(cluster.status)
    ) {
      void (async () => {
        try {
          const resp = await ClustersAPI.getCredentials(cluster.id);
          setConsoleUrl(resp.data.consoleUrl);
        } catch {
          // Nothing to do
        }
      })();
    }
  }, [cluster?.id, cluster?.status, consoleUrl]);

  if (!clusterRef.current && cluster && uiState === ResourceUIState.POLLING_ERROR) {
    const boostrapHost = cluster.hosts?.find((h) => h.bootstrap);
    if (boostrapHost) {
      const stages = getHostProgressStages(boostrapHost);
      const rebootIdx = stages.findIndex((s) => s === 'Rebooting');
      const currentStage = boostrapHost.progress?.currentStage;
      // Show finalizing page as soon as we fail to poll and bootstrap is Rebooting or state before
      if (!!currentStage && stages.slice(rebootIdx - 2, stages.length).includes(currentStage)) {
        clusterRef.current = cluster;
      }
    }
  }

  return { cluster: clusterRef.current, consoleUrl };
};

const ClusterPage = () => {
  const { clusterId } = useParams() as { clusterId: string };
  const { cluster, consoleUrl } = useFinalizerPage();

  return cluster ? (
    <SingleClusterFinalizerPage cluster={cluster} consoleUrl={consoleUrl} />
  ) : (
    <SingleClusterPage clusterId={clusterId} resetModal={<ResetSingleClusterModal />} />
  );
};

export default ClusterPage;
