import React from 'react';
import { Link, RouteComponentProps, Redirect } from 'react-router-dom';
import {
  PageSection,
  PageSectionVariants,
  ButtonVariant,
  Button,
  TextContent,
  Text,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useSelector } from 'react-redux';
import { ErrorState, LoadingState } from '../ui/uiState';
import { ResourceUIState } from '../../types';
import { selectCurrentClusterState } from '../../selectors/currentCluster';
import { Cluster } from '../../api/types';
import { isSingleClusterMode, routeBasePath } from '../../config/constants';
import ClusterDetail from '../clusterDetail/ClusterDetail';
import CancelInstallationModal from '../clusterDetail/CancelInstallationModal';
import ResetClusterModal from '../clusterDetail/ResetClusterModal';
import { AlertsContextProvider } from '../AlertsContextProvider';
import { AddBareMetalHosts } from '../AddBareMetalHosts';
import { AddBareMetalHostsContextProvider } from '../AddBareMetalHosts/AddBareMetalHostsContext';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { EventsModalButton } from '../ui/eventsModal';
import ClusterWizard from '../clusterWizard/ClusterWizard';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import { useClusterPolling, useFetchCluster } from './clusterPolling';

type MatchParams = {
  clusterId: string;
};

const ClusterPage: React.FC<RouteComponentProps<MatchParams>> = ({ match }) => {
  const { clusterId } = match.params;
  const { data: cluster, uiState, errorDetail } = useSelector(selectCurrentClusterState);
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
      return (
        <AddBareMetalHostsContextProvider cluster={cluster}>
          <AddBareMetalHosts />
        </AddBareMetalHostsContextProvider>
      );
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
        <>
          <ClusterBreadcrumbs clusterName={cluster.name} />
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1">{cluster.name}</Text>
            </TextContent>
          </PageSection>
          <PageSection variant={PageSectionVariants.light} isFilled>
            <ClusterDetail cluster={cluster} />
          </PageSection>
        </>
      );
    } else {
      return (
        <>
          <ClusterBreadcrumbs clusterName={cluster.name} />
          <PageSection variant={PageSectionVariants.light}>
            <Split>
              <SplitItem>
                <TextContent>
                  <Text component="h1">
                    Install OpenShift on Bare Metal with the Assisted Installer
                  </Text>
                </TextContent>
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <EventsModalButton
                  id="cluster-events-button"
                  entityKind="cluster"
                  cluster={cluster}
                  title="Cluster Events"
                  variant={ButtonVariant.secondary}
                >
                  View Cluster Events
                </EventsModalButton>
              </SplitItem>
            </Split>
          </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            <ClusterWizard cluster={cluster} />
          </PageSection>
        </>
      );
    }
  };

  const loadingUI = (
    <PageSection variant={PageSectionVariants.light} isFilled>
      <LoadingState />
    </PageSection>
  );

  if (uiState === ResourceUIState.LOADING) {
    return loadingUI;
  }

  if (uiState === ResourceUIState.ERROR) {
    if (errorDetail?.code === '404') {
      return <Redirect to={`${routeBasePath}/clusters`} />;
    }

    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState
          title="Failed to fetch the cluster"
          fetchData={fetchCluster}
          actions={errorStateActions}
        />
      </PageSection>
    );
  }

  const errorUI = (
    <PageSection variant={PageSectionVariants.light} isFilled>
      <ErrorState
        title="Failed to retrieve the default configuration"
        actions={errorStateActions}
      />
    </PageSection>
  );

  if (cluster) {
    return (
      <AlertsContextProvider>
        <ModalDialogsContextProvider>
          <ClusterDefaultConfigurationProvider loadingUI={loadingUI} errorUI={errorUI}>
            {getContent(cluster)}
            <CancelInstallationModal />
            <ResetClusterModal />
          </ClusterDefaultConfigurationProvider>
        </ModalDialogsContextProvider>
      </AlertsContextProvider>
    );
  }

  return <Redirect to="/clusters" />;
};

export default ClusterPage;
