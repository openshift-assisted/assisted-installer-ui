import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core';
import {
  AddHostsContextProvider,
  AlertsContextProvider,
  Cluster,
  CpuArchitecture,
  ErrorState,
  InfraEnv,
  ResourceUIState,
} from '../../../common';
import ClusterDetail from '../clusterDetail/ClusterDetail';
import CancelInstallationModal from '../clusterDetail/CancelInstallationModal';
import ResetClusterModal from '../clusterDetail/ResetClusterModal';
import { AddHosts } from '../AddHosts';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import ClusterWizard from '../clusterWizard/ClusterWizard';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import { useClusterPolling, useFetchCluster } from './clusterPolling';
import { DiscoveryImageModal } from '../clusterConfiguration/DiscoveryImageModal';
import { routeBasePath } from '../../config';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';
import useInfraEnv from '../../hooks/useInfraEnv';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
import { forceReload } from '../../reducers/clusters';
import { ClusterUiError } from './ClusterPageErrors';
import ClusterLoading from './ClusterLoading';
import ClusterPollingErrorModal from '../clusterDetail/ClusterPollingErrorModal';
import ClusterUpdateErrorModal from '../clusterDetail/ClusterUpdateErrorModal';
import { BackButton } from '../ui/Buttons/BackButton';

type MatchParams = {
  clusterId: string;
};

const ClusterPage: React.FC<RouteComponentProps<MatchParams>> = ({ match }) => {
  const { clusterId } = match.params;
  const fetchCluster = useFetchCluster(clusterId);
  const { cluster, uiState, errorDetail } = useClusterPolling(clusterId);
  const {
    infraEnv,
    isLoading: infraEnvLoading,
    error: infraEnvError,
    updateInfraEnv,
  } = useInfraEnv(clusterId, CpuArchitecture.USE_DAY1_ARCHITECTURE);

  const getContent = (cluster: Cluster, infraEnv: InfraEnv) => {
    if (cluster.status === 'adding-hosts') {
      return (
        <AddHostsContextProvider cluster={cluster} resetCluster={forceReload}>
          <AddHosts />
        </AddHostsContextProvider>
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
            <TextContent>
              <Text component="h1" className="pf-u-display-inline">
                Install OpenShift with the Assisted Installer
              </Text>
            </TextContent>
          </PageSection>
          <PageSection variant={PageSectionVariants.light}>
            <ClusterWizardContextProvider cluster={cluster} infraEnv={infraEnv}>
              <ClusterWizard
                cluster={cluster}
                infraEnv={infraEnv}
                updateInfraEnv={updateInfraEnv}
              />
            </ClusterWizardContextProvider>
          </PageSection>
        </>
      );
    }
  };

  if (uiState === ResourceUIState.LOADING || infraEnvLoading) {
    return <ClusterLoading />;
  }

  if (uiState === ResourceUIState.POLLING_ERROR && !cluster) {
    if (Number(errorDetail?.code) === 404) {
      return <Redirect to={`${routeBasePath}/clusters`} />;
    }
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState
          title="Failed to fetch the cluster"
          fetchData={
            Number(errorDetail?.code) === 401 ? () => window.location.reload() : fetchCluster
          }
          actions={[<BackButton key={'cancel'} to={`${routeBasePath}/clusters`} />]}
        />
      </PageSection>
    );
  }

  if (infraEnvError) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState
          title="Cluster not found"
          actions={[<BackButton key={'cancel'} to={`${routeBasePath}/clusters`} />]}
          content={
            'Check to make sure the cluster-ID is valid. Otherwise, the cluster may have been deleted.'
          }
        />
      </PageSection>
    );
  }

  if (cluster && infraEnv) {
    return (
      <AlertsContextProvider>
        <SentryErrorMonitorContextProvider>
          <ModalDialogsContextProvider>
            <ClusterDefaultConfigurationProvider
              loadingUI={<ClusterLoading />}
              errorUI={<ClusterUiError />}
            >
              <FeatureSupportLevelProvider loadingUi={<ClusterLoading />} cluster={cluster}>
                {getContent(cluster, infraEnv)}
                {uiState === ResourceUIState.POLLING_ERROR && <ClusterPollingErrorModal />}
                {uiState === ResourceUIState.UPDATE_ERROR && <ClusterUpdateErrorModal />}
                <CancelInstallationModal />
                <ResetClusterModal />
                <DiscoveryImageModal />
              </FeatureSupportLevelProvider>
            </ClusterDefaultConfigurationProvider>
          </ModalDialogsContextProvider>
        </SentryErrorMonitorContextProvider>
      </AlertsContextProvider>
    );
  }

  return <Redirect to="/clusters" />;
};

export default ClusterPage;
