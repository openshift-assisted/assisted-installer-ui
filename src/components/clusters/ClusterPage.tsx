import React from 'react';
import { Link, RouteComponentProps, Redirect } from 'react-router-dom';
import { PageSectionVariants, ButtonVariant, Button } from '@patternfly/react-core';
import { useSelector, useDispatch } from 'react-redux';
import PageSection from '../ui/PageSection';
import { ErrorState, LoadingState } from '../ui/uiState';
import { ResourceUIState } from '../../types';
import { selectCurrentClusterState } from '../../selectors/currentCluster';
import {
  fetchClusterAsync,
  cleanCluster,
  forceReload,
  cancelForceReload,
} from '../../features/clusters/currentClusterSlice';
import { Cluster } from '../../api/types';
import { isSingleClusterMode, POLLING_INTERVAL, routeBasePath } from '../../config/constants';
import ClusterConfiguration from '../clusterConfiguration/ClusterConfiguration';
import ClusterDetail from '../clusterDetail/ClusterDetail';
import CancelInstallationModal from '../clusterDetail/CancelInstallationModal';
import ResetClusterModal from '../clusterDetail/ResetClusterModal';
import { AlertsContextProvider } from '../AlertsContextProvider';
import { AddBareMetalHosts } from '../AddBareMetalHosts';

type MatchParams = {
  clusterId: string;
};

const useFetchCluster = (clusterId: string) => {
  const dispatch = useDispatch();
  return React.useCallback(() => dispatch(fetchClusterAsync(clusterId)), [clusterId, dispatch]);
};

const useClusterPolling = (clusterId: string) => {
  const { isReloadScheduled, uiState } = useSelector(selectCurrentClusterState);
  const dispatch = useDispatch();
  const fetchCluster = useFetchCluster(clusterId);

  React.useEffect(() => {
    if (isReloadScheduled) {
      if (![ResourceUIState.LOADING, ResourceUIState.RELOADING].includes(uiState)) {
        fetchCluster();
      }
    }
    dispatch(cancelForceReload());
  }, [fetchCluster, dispatch, isReloadScheduled, uiState]);

  React.useEffect(() => {
    fetchCluster();
    const timer = setInterval(() => dispatch(forceReload()), POLLING_INTERVAL);
    return () => {
      clearInterval(timer);
      dispatch(cancelForceReload());
      dispatch(cleanCluster());
    };
  }, [dispatch, fetchCluster]);
};

const ClusterPage: React.FC<RouteComponentProps<MatchParams>> = ({ match }) => {
  const { clusterId } = match.params;
  const { data: cluster, uiState, errorDetail } = useSelector(selectCurrentClusterState);
  const [cancelInstallationModalOpen, setCancelInstallationModalOpen] = React.useState(false);
  const [resetClusterModalOpen, setResetClusterModalOpen] = React.useState(false);
  const fetchCluster = useFetchCluster(clusterId);
  useClusterPolling(clusterId);

  const errorStateActions = [];
  if (!isSingleClusterMode()) {
    errorStateActions.push(
      <Button
        key="cancel"
        variant={ButtonVariant.secondary}
        component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
      >
        Back
      </Button>,
    );
  }

  const getContent = (cluster: Cluster) => {
    if (cluster.status === 'adding-hosts') {
      return <AddBareMetalHosts cluster={cluster} />;
    } else if (
      [
        'preparing-for-installation',
        'installing',
        'installing-pending-user-action',
        'finalizing',
        'installed',
        'error',
        'cancelled',
      ].includes(cluster.status)
    ) {
      return (
        <ClusterDetail
          cluster={cluster}
          setCancelInstallationModalOpen={setCancelInstallationModalOpen}
          setResetClusterModalOpen={setResetClusterModalOpen}
        />
      );
    } else {
      return <ClusterConfiguration cluster={cluster} />;
    }
  };

  if (uiState === ResourceUIState.LOADING) {
    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <LoadingState />
      </PageSection>
    );
  }

  if (uiState === ResourceUIState.ERROR) {
    if (errorDetail?.code === '404') {
      return <Redirect to={`${routeBasePath}/clusters`} />;
    }

    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <ErrorState
          title="Failed to fetch the cluster"
          fetchData={fetchCluster}
          actions={errorStateActions}
        />
      </PageSection>
    );
  }

  if (cluster) {
    return (
      <AlertsContextProvider>
        {getContent(cluster)}
        <CancelInstallationModal
          isOpen={cancelInstallationModalOpen}
          onClose={() => setCancelInstallationModalOpen(false)}
          clusterId={cluster.id}
        />
        <ResetClusterModal
          isOpen={resetClusterModalOpen}
          onClose={() => setResetClusterModalOpen(false)}
          cluster={cluster}
        />
      </AlertsContextProvider>
    );
  }

  return <Redirect to="/clusters" />;
};

export default ClusterPage;
