import React from 'react';
import { Provider } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, ButtonVariant, Card, CardBody, CardHeader, Title } from '@patternfly/react-core';
import { store } from '../../store';
import { isSingleClusterMode, OCM_CLUSTER_LIST_LINK } from '../../config';
import {
  AlertsContextProvider,
  AssistedInstallerOCMPermissionTypesListType,
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
import { DiscoveryImageModal } from '../clusterConfiguration/discoveryImageModal';
import ClusterInstallationProgressCard from './ClusterInstallationProgressCard';
import CancelInstallationModal from './CancelInstallationModal';
import ResetClusterModal from './ResetClusterModal';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import useInfraEnv from '../../hooks/useInfraEnv';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';

type AssistedInstallerDetailCardProps = {
  aiClusterId: string;
  allEnabledFeatures: FeatureListType;
  permissions?: AssistedInstallerOCMPermissionTypesListType;
};

const errorStateActions: React.ReactNode[] = [];
if (!isSingleClusterMode()) {
  errorStateActions.push(
    <Button
      key="cancel"
      variant={ButtonVariant.secondary}
      component={(props) => <Link to={OCM_CLUSTER_LIST_LINK} {...props} />}
    >
      Back
    </Button>,
  );
}

const LoadingCard: React.FC = () => (
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

const ClusterLoadFailed: React.FC<{ fetchCluster: () => void }> = ({ fetchCluster }) => (
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
        actions={errorStateActions}
      />
    </CardBody>
  </Card>
);

const LoadingDefaultConfigFailedCard: React.FC = () => (
  <Card data-testid="ai-cluster-details-card">
    <CardHeader>
      <Title headingLevel="h1" size="lg" className="card-title">
        Loading additional details
      </Title>
    </CardHeader>
    <CardBody>
      <ErrorState
        title="Failed to retrieve the default configuration"
        actions={errorStateActions}
      />
    </CardBody>
  </Card>
);

const AssistedInstallerDetailCard: React.FC<AssistedInstallerDetailCardProps> = ({
  aiClusterId,
  allEnabledFeatures,
  permissions,
}) => {
  const fetchCluster = useFetchCluster(aiClusterId);
  const { cluster, uiState } = useClusterPolling(aiClusterId);
  const {
    infraEnv,
    isLoading: infraEnvLoading,
    error: infraEnvError,
    updateInfraEnv,
  } = useInfraEnv(aiClusterId, CpuArchitecture.DAY1_ARCHITECTURE);
  if (uiState === ResourceUIState.LOADING || infraEnvLoading) {
    return <LoadingCard />;
  } else if (uiState === ResourceUIState.ERROR || infraEnvError) {
    return <ClusterLoadFailed fetchCluster={fetchCluster} />;
  }

  if (!cluster || !infraEnv) {
    return null;
  }

  if (cluster.status === 'adding-hosts') {
    // TODO(mlibra): So far the Day 2 is rendered in a separate tab. Merge it to a single smooth flow.
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

const Wrapper: React.FC<AssistedInstallerDetailCardProps> = (props) => (
  <Provider store={store}>
    <AssistedInstallerDetailCard {...props} />
  </Provider>
);

// TODO(mlibra): The provider should go higher within the OCM hierarchy otherwise we do not have multiple cards/tabs with redux.
export default Wrapper;
