import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import {
  Button,
  ButtonVariant,
  PageSectionVariants,
  TextContent,
  Text,
} from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import { selectClusterTableRows, selectClustersUIState } from '../../selectors/clusters';
import { routeBasePath } from '../../config/constants';
import { LoadingState, ErrorState, EmptyState } from '../ui/uiState';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { ResourceUIState } from '../../types';
import ClustersTable from './ClustersTable';
import { fetchClustersAsync, deleteCluster } from '../../features/clusters/clustersSlice';
import { deleteCluster as ApiDeleteCluster } from '../../api/clusters';
import Alerts from '../ui/Alerts';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { AlertsContext, AlertsContextProvider } from '../AlertsContextProvider';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';

type ClustersProps = RouteComponentProps;

const Clusters: React.FC<ClustersProps> = ({ history }) => {
  const { LOADING, EMPTY, ERROR, RELOADING } = ResourceUIState;
  const { addAlert } = React.useContext(AlertsContext);
  const clusterRows = useSelector(selectClusterTableRows);
  const clustersUIState = useSelector(selectClustersUIState);
  const uiState = React.useRef(clustersUIState);
  if (clustersUIState !== RELOADING) {
    uiState.current = clustersUIState;
  }
  const dispatch = useDispatch();
  const fetchClusters = React.useCallback(() => dispatch(fetchClustersAsync()), [dispatch]);
  const deleteClusterAsync = React.useCallback(
    async (clusterId) => {
      try {
        await ApiDeleteCluster(clusterId);
        dispatch(deleteCluster(clusterId));
      } catch (e) {
        return handleApiError(e, () =>
          addAlert({
            title: 'Cluster could not be deleted',
            message: getErrorMessage(e),
          }),
        );
      }
    },
    [dispatch, addAlert],
  );

  React.useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  switch (uiState.current) {
    case LOADING:
      return (
        <PageSection variant={PageSectionVariants.light} isMain>
          <LoadingState />
        </PageSection>
      );
    case ERROR:
      return (
        <PageSection variant={PageSectionVariants.light} isMain>
          <ErrorState title="Failed to fetch clusters." fetchData={fetchClusters} />
        </PageSection>
      );
    case EMPTY:
      return (
        <PageSection variant={PageSectionVariants.light} isMain>
          <EmptyState
            icon={AddCircleOIcon}
            title="Create new bare metal cluster"
            content="There are no clusters yet. This wizard is going to guide you through the OpenShift bare metal cluster deployment."
            primaryAction={
              <Button
                variant={ButtonVariant.primary}
                onClick={() => history.push(`${routeBasePath}/clusters/~new`)}
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
      return (
        <>
          <ClusterBreadcrumbs />
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1">Assisted Bare Metal Clusters</Text>
            </TextContent>
          </PageSection>
          <PageSection variant={PageSectionVariants.light} isMain>
            <Alerts />
            <ClustersTable rows={clusterRows} deleteCluster={deleteClusterAsync} />
          </PageSection>
        </>
      );
  }
};

const ClustersPage: React.FC<RouteComponentProps> = (props) => (
  <AlertsContextProvider>
    <Clusters {...props} />
  </AlertsContextProvider>
);

export default ClustersPage;
