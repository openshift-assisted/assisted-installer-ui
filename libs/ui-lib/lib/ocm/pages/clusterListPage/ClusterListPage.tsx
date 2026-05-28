import React from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonVariant, Content, PageSection } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { AddCircleOIcon } from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import {
  Alerts,
  AlertsContextProvider,
  EmptyState,
  ErrorState,
  getApiErrorMessage,
  handleApiError,
  LoadingState,
  REDUCED_POLLING_INTERVAL,
  ResourceUIState,
  useAlerts,
  useTranslation,
} from '../../../common';
import { ClustersService } from '../../services';
import { ClusterPollingErrorModal } from '../../components';
import {
  selectClustersUIState,
  useDispatchDay1,
  fetchClustersAsync,
  deleteCluster,
  useSelectorDay1,
  selectClusterTableRows,
} from '../../store';
import { ClustersTable } from './ClustersTable';

const ClusterListPageContent = () => {
  const navigate = useNavigate();
  const { LOADING, EMPTY, POLLING_ERROR, RELOADING } = ResourceUIState;
  const { addAlert } = useAlerts();
  const { t } = useTranslation();
  const clusterRows = useSelectorDay1(selectClusterTableRows(t));
  const clustersUIState = useSelectorDay1(selectClustersUIState);
  const uiState = React.useRef(clustersUIState);
  if (clustersUIState !== RELOADING) {
    uiState.current = clustersUIState;
  }
  const dispatch = useDispatchDay1();
  const deleteClusterAsync = React.useCallback(
    async (clusterId: Cluster['id']) => {
      try {
        await ClustersService.remove(clusterId);
        dispatch(deleteCluster(clusterId));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Cluster could not be deleted',
            message: getApiErrorMessage(e),
          }),
        );
      }
    },
    [dispatch, addAlert],
  );

  const fetchClusters = React.useCallback(() => void dispatch(fetchClustersAsync()), [dispatch]);

  React.useEffect(() => {
    // Fetch immediately on mount
    fetchClusters();

    // Set up polling for subsequent updates
    const timer = setInterval(() => {
      fetchClusters();
    }, REDUCED_POLLING_INTERVAL);

    return () => clearInterval(timer);
  }, [fetchClusters]);

  switch (uiState.current) {
    case LOADING:
      return (
        <PageSection hasBodyWrapper={false} isFilled>
          <LoadingState />
        </PageSection>
      );
    case EMPTY:
      return (
        <PageSection hasBodyWrapper={false} isFilled>
          <EmptyState
            icon={AddCircleOIcon}
            title="Create new assisted cluster"
            content="There are no clusters yet. This wizard is going to guide you through the OpenShift cluster deployment."
            primaryAction={
              <Button
                variant={ButtonVariant.primary}
                onClick={() => void navigate(`~new`)}
                id="empty-state-new-cluster-button"
                data-ouia-id="button-create-new-cluster"
              >
                Create New Cluster
              </Button>
            }
          />
        </PageSection>
      );
    default:
      if (clusterRows.length === 0 && uiState.current === POLLING_ERROR) {
        return (
          <PageSection hasBodyWrapper={false} isFilled>
            <ErrorState title="Failed to fetch clusters." fetchData={fetchClusters} />
          </PageSection>
        );
      } else {
        return (
          <>
            <PageSection hasBodyWrapper={false}>
              <Content component="h1">Assisted Clusters</Content>
            </PageSection>
            <PageSection hasBodyWrapper={false} isFilled>
              <Alerts />
              <ClustersTable rows={clusterRows} deleteCluster={deleteClusterAsync} />
            </PageSection>
            {uiState.current === POLLING_ERROR && (
              <ClusterPollingErrorModal
                title={'Failed to fetch clusters'}
                content={
                  'There was an error retrieving data. Check your connection and try refreshing the page.'
                }
              />
            )}
          </>
        );
      }
  }
};

export const ClusterListPage = () => {
  return (
    <AlertsContextProvider>
      <ClusterListPageContent />
    </AlertsContextProvider>
  );
};
