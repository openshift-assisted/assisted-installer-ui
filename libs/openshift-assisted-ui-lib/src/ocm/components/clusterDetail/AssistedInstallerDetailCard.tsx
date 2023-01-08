import React from 'react';
import { Provider } from 'react-redux';
import { Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import { store } from '../../store';
import { OCM_CLUSTER_LIST_LINK } from '../../config';
import {
  AlertsContextProvider,
  AssistedInstallerOCMPermissionTypesListType,
  Cluster,
  CpuArchitecture,
  ErrorState,
  FeatureGateContextProvider,
  FeatureListType,
  LoadingState,
  ResourceUIState,
} from '../../../common';
import { useClusterPolling, useFetchCluster } from '../clusters/clusterPolling';
import ClusterWizard from '../clusterWizard/ClusterWizard';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import ClusterInstallationProgressCard from './ClusterInstallationProgressCard';
import { DiscoveryImageModal } from '../clusterConfiguration/DiscoveryImageModal';
import CancelInstallationModal from './CancelInstallationModal';
import ResetClusterModal from './ResetClusterModal';
import ClusterPollingErrorModal from './ClusterPollingErrorModal';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import useInfraEnv from '../../hooks/useInfraEnv';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';
import { BackButton } from '../ui/Buttons/BackButton';

type AssistedInstallerDetailCardProps = {
  aiClusterId: string;
  allEnabledFeatures: FeatureListType;
  permissions?: AssistedInstallerOCMPermissionTypesListType;
};

const LoadingCard = () => (
  <Card data-testid="ai-cluster-details-card">
    <CardHeader>
      <Title headingLevel="h1" size="lg" className="card-title">
        Loading additional details
      </Title>
    </CardHeader>
    <CardBody>
      <LoadingState />
    </CardBody>
  </Card>
);

const ClusterLoadFailed = ({ clusterId }: { clusterId: Cluster['id'] }) => {
  const fetchCluster = useFetchCluster(clusterId);
  return (
    <Card data-testid="ai-cluster-details-card">
      <CardHeader>
        <Title headingLevel="h1" size="lg" className="card-title">
          Loading additional details
        </Title>
      </CardHeader>
      <CardBody>
        <ErrorState
          title="Failed to fetch the cluster"
          fetchData={fetchCluster}
          actions={[<BackButton key={'cancel'} to={OCM_CLUSTER_LIST_LINK} />]}
        />
      </CardBody>
    </Card>
  );
};

const LoadingDefaultConfigFailedCard = () => (
  <Card data-testid="ai-cluster-details-card">
    <CardHeader>
      <Title headingLevel="h1" size="lg" className="card-title">
        Loading additional details
      </Title>
    </CardHeader>
    <CardBody>
      <ErrorState
        title="Failed to retrieve the default configuration"
        actions={[<BackButton key={'cancel'} to={OCM_CLUSTER_LIST_LINK} />]}
      />
    </CardBody>
  </Card>
);

const AssistedInstallerDetailCard = ({
  aiClusterId,
  allEnabledFeatures,
  permissions,
}: AssistedInstallerDetailCardProps) => {
  const { cluster, uiState } = useClusterPolling(aiClusterId);
  const {
    infraEnv,
    isLoading: infraEnvLoading,
    error: infraEnvError,
    updateInfraEnv,
  } = useInfraEnv(aiClusterId, CpuArchitecture.USE_DAY1_ARCHITECTURE);
  if (uiState === ResourceUIState.LOADING || infraEnvLoading) {
    return <LoadingCard />;
  } else if ((uiState === ResourceUIState.POLLING_ERROR && !cluster) || infraEnvError) {
    return <ClusterLoadFailed clusterId={aiClusterId} />;
  }

  if (!cluster || !infraEnv || cluster.status === 'adding-hosts') {
    // In OCM the Day 2 flow is rendered in a separate tab.
    return null;
  }

  const showWizard = ['insufficient', 'ready', 'pending-for-input'].includes(cluster.status);

  const content = (
    <ClusterWizardContextProvider cluster={cluster} infraEnv={infraEnv} permissions={permissions}>
      {showWizard ? (
        <ClusterWizard cluster={cluster} infraEnv={infraEnv} updateInfraEnv={updateInfraEnv} />
      ) : (
        <ClusterInstallationProgressCard cluster={cluster} />
      )}
    </ClusterWizardContextProvider>
  );

  const isOutdatedClusterData = uiState === ResourceUIState.POLLING_ERROR;
  return (
    <FeatureGateContextProvider features={allEnabledFeatures}>
      <AlertsContextProvider>
        <SentryErrorMonitorContextProvider>
          <ModalDialogsContextProvider>
            <ClusterDefaultConfigurationProvider
              loadingUI={<LoadingCard />}
              errorUI={<LoadingDefaultConfigFailedCard />}
            >
              <FeatureSupportLevelProvider loadingUi={<LoadingCard />} cluster={cluster}>
                {content}
              </FeatureSupportLevelProvider>
              {isOutdatedClusterData && <ClusterPollingErrorModal />}
              <CancelInstallationModal />
              <ResetClusterModal />
              <DiscoveryImageModal />
            </ClusterDefaultConfigurationProvider>
          </ModalDialogsContextProvider>
        </SentryErrorMonitorContextProvider>
      </AlertsContextProvider>
    </FeatureGateContextProvider>
  );
};

const Wrapper = (props: AssistedInstallerDetailCardProps) => (
  <Provider store={store}>
    <AssistedInstallerDetailCard {...props} />
  </Provider>
);

export default Wrapper;
