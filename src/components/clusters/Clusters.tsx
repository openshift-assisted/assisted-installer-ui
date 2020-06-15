import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PageSectionVariants,
  TextContent,
  Text,
  TextVariants,
  Spinner,
} from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import { selectClusterTableRows, selectClustersUIState } from '../../selectors/clusters';
import { ToolbarText, ToolbarButton } from '../ui/Toolbar';
import ClusterToolbar from './ClusterToolbar';
import { LoadingState, ErrorState, EmptyState } from '../ui/uiState';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { ResourceUIState } from '../../types';
import ClustersTable from './ClustersTable';
import { fetchClustersAsync, deleteCluster } from '../../features/clusters/clustersSlice';
import { deleteCluster as ApiDeleteCluster } from '../../api/clusters';
import { NewClusterModalButton, NewClusterModal } from './newClusterModal';
import AlertsSection from '../ui/AlertsSection';
import { handleApiError, getErrorMessage } from '../../api/utils';
import alertsReducer, {
  addAlert,
  AlertProps,
  removeAlert,
} from '../../features/alerts/alertsSlice';

const Clusters: React.FC = () => {
  const { LOADING, EMPTY, ERROR, RELOADING } = ResourceUIState;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [alerts, dispatchAlertsAction] = React.useReducer(alertsReducer, []);
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
          dispatchAlertsAction(
            addAlert({
              title: 'Cluster could not be deleted',
              message: getErrorMessage(e),
            }),
          ),
        );
      }
    },
    [dispatch],
  );

  React.useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const openModal = React.useCallback(() => setIsModalOpen(true), [setIsModalOpen]);
  const closeModal = React.useCallback(() => setIsModalOpen(false), [setIsModalOpen]);

  let body: JSX.Element;
  switch (uiState.current) {
    case LOADING:
      body = (
        <PageSection variant={PageSectionVariants.light} isMain>
          <LoadingState />
        </PageSection>
      );
      break;
    case ERROR:
      body = (
        <PageSection variant={PageSectionVariants.light} isMain>
          <ErrorState title="Failed to fetch clusters." fetchData={fetchClusters} />
        </PageSection>
      );
      break;
    case EMPTY:
      body = (
        <PageSection variant={PageSectionVariants.light} isMain>
          <EmptyState
            icon={AddCircleOIcon}
            title="Create new bare metal cluster"
            content="There are no clusters yet. This wizard is going to guide you through the OpenShift bare metal cluster deployment."
            primaryAction={<NewClusterModalButton onClick={openModal} />}
          />
        </PageSection>
      );
      break;
    default:
      // TODO(jtomasek): if there is just one cluster, redirect to it's detail
      body = (
        <>
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1">Managed Clusters</Text>
            </TextContent>
          </PageSection>
          <PageSection variant={PageSectionVariants.light} isMain>
            <ClustersTable rows={clusterRows} deleteCluster={deleteClusterAsync} />
          </PageSection>
          <AlertsSection
            alerts={alerts}
            onClose={(alert: AlertProps) => dispatchAlertsAction(removeAlert(alert.key))}
          />
          <ClusterToolbar>
            <NewClusterModalButton onClick={openModal} ButtonComponent={ToolbarButton} />
            <ToolbarText component={TextVariants.small}>
              {clustersUIState === RELOADING && (
                <>
                  <Spinner size="sm" /> Fetching clusters...
                </>
              )}
            </ToolbarText>
          </ClusterToolbar>
        </>
      );
  }
  return (
    <>
      {body}
      {isModalOpen && <NewClusterModal closeModal={closeModal} />}
    </>
  );
};

export default Clusters;
