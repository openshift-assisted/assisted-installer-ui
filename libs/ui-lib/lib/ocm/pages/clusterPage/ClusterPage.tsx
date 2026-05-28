import React from 'react';
import { useParams, Navigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { PageSection, Content } from '@patternfly/react-core';

import {
  Cluster,
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  AddHostsContextProvider,
  AlertsContextProvider,
  CpuArchitecture,
  ErrorState,
  ResourceUIState,
} from '../../../common';
import { routeBasePath } from '../../config';
import { useInfraEnv, usePullSecret } from '../../hooks';
import { forceReload } from '../../store/slices/current-cluster/slice';
import ClusterDetail from '../../components/clusterDetail/ClusterDetail';
import {
  AddHosts,
  ClusterDefaultConfigurationProvider,
  ClusterLoading,
  ClusterUiError,
  ClusterWizard,
  ClusterWizardContextProvider,
  ModalDialogsContextProvider,
  NewFeatureSupportLevelProvider,
  OpenShiftVersionsContextProvider,
  useClusterPolling,
  ClusterPollingErrorModal,
} from '../../components';
import { DiscoveryImageModal } from '../../components/clusterConfiguration/DiscoveryImageModal';
import CancelInstallationModal from '../../components/clusterDetail/CancelInstallationModal';
import ClusterUpdateErrorModal from '../../components/clusterDetail/ClusterUpdateErrorModal';
import ResetClusterModal from '../../components/clusterDetail/ResetClusterModal';
import { AssistedInstallerHeader } from '../../components/clusters/AssistedInstallerHeader';
import ClusterBreadcrumbs from '../../components/clusters/ClusterBreadcrumbs';
import { useFetchCluster } from '../../components/clusters/clusterPolling';
import { SentryErrorMonitorContextProvider } from '../../components/SentryErrorMonitorContextProvider';
import { BackButton } from '../../components/ui/Buttons/BackButton';

const ClusterPageContent = ({
  cluster,
  infraEnv,
  updateInfraEnv,
  showBreadcrumbs = false,
}: {
  cluster: Cluster;
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
  showBreadcrumbs?: boolean;
}) => {
  const dispatch = useDispatch();

  if (cluster.status === 'adding-hosts') {
    const onReset = async () => {
      dispatch(forceReload());
      return Promise.resolve();
    };
    return (
      <AddHostsContextProvider cluster={cluster} resetCluster={onReset}>
        <OpenShiftVersionsContextProvider>
          <AddHosts />
        </OpenShiftVersionsContextProvider>
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
        {showBreadcrumbs && <ClusterBreadcrumbs clusterName={cluster.name} />}
        <PageSection hasBodyWrapper={false}>
          <Content component="h1">{cluster.name}</Content>
        </PageSection>
        <PageSection hasBodyWrapper={false} isFilled>
          <ClusterDetail cluster={cluster} />
        </PageSection>
      </>
    );
  } else {
    return (
      <>
        {showBreadcrumbs && <ClusterBreadcrumbs clusterName={cluster.name} />}
        {showBreadcrumbs && (
          <PageSection hasBodyWrapper={false}>
            <AssistedInstallerHeader clusterName={cluster.name} />
          </PageSection>
        )}

        <PageSection hasBodyWrapper={false}>
          <ClusterWizardContextProvider cluster={cluster} infraEnv={infraEnv}>
            <ClusterWizard cluster={cluster} infraEnv={infraEnv} updateInfraEnv={updateInfraEnv} />
          </ClusterWizardContextProvider>
        </PageSection>
      </>
    );
  }
};

export const ClusterPageGeneric = ({
  clusterId,
  showBreadcrumbs = false,
  resetModal,
}: {
  clusterId: string;
  showBreadcrumbs?: boolean;
  resetModal?: React.ReactNode;
}) => {
  const fetchCluster = useFetchCluster(clusterId);
  const { cluster, uiState, errorDetail } = useClusterPolling(clusterId);
  const pullSecret = usePullSecret();
  const {
    infraEnv,
    isLoading: infraEnvLoading,
    error: infraEnvError,
    updateInfraEnv,
  } = useInfraEnv(
    clusterId,
    cluster?.cpuArchitecture
      ? (cluster.cpuArchitecture as CpuArchitecture)
      : CpuArchitecture.USE_DAY1_ARCHITECTURE,
    cluster?.name,
    pullSecret,
    cluster?.openshiftVersion,
  );

  if (uiState === ResourceUIState.LOADING || infraEnvLoading) {
    return <ClusterLoading />;
  }

  if (uiState === ResourceUIState.POLLING_ERROR && !cluster) {
    if (Number(errorDetail?.code) === 404) {
      return <Navigate to={`${routeBasePath}/clusters`} />;
    }
    return (
      <PageSection hasBodyWrapper={false} isFilled>
        <ErrorState
          title="Failed to fetch the cluster"
          fetchData={
            Number(errorDetail?.code) === 401 ? () => window.location.reload() : fetchCluster
          }
          actions={[<BackButton key={'cancel'} to={'..'} />]}
        />
      </PageSection>
    );
  }

  if (infraEnvError) {
    return (
      <PageSection hasBodyWrapper={false} isFilled>
        <ErrorState
          title="Cluster details not found"
          actions={[<BackButton key={'cancel'} to={`..`} />]}
          content={
            'Check to make sure the cluster-ID is valid. Otherwise, the cluster details may have been deleted.'
          }
        />
      </PageSection>
    );
  }

  if (cluster && infraEnv) {
    return (
      <ClusterWizardContextProvider cluster={cluster} infraEnv={infraEnv}>
        <AlertsContextProvider>
          <SentryErrorMonitorContextProvider>
            <ModalDialogsContextProvider>
              <ClusterDefaultConfigurationProvider
                loadingUI={<ClusterLoading />}
                errorUI={<ClusterUiError />}
              >
                <OpenShiftVersionsContextProvider>
                  <NewFeatureSupportLevelProvider
                    loadingUi={<ClusterLoading />}
                    cluster={cluster}
                    cpuArchitecture={infraEnv.cpuArchitecture as CpuArchitecture}
                    openshiftVersion={cluster.openshiftVersion}
                    platformType={cluster.platform?.type}
                  >
                    <ClusterPageContent
                      cluster={cluster}
                      infraEnv={infraEnv}
                      showBreadcrumbs={showBreadcrumbs}
                      updateInfraEnv={updateInfraEnv}
                    />
                    {uiState === ResourceUIState.POLLING_ERROR && <ClusterPollingErrorModal />}
                    {uiState === ResourceUIState.UPDATE_ERROR && <ClusterUpdateErrorModal />}
                    <CancelInstallationModal />
                    <ResetClusterModal />
                    {resetModal}
                    <DiscoveryImageModal />
                  </NewFeatureSupportLevelProvider>
                </OpenShiftVersionsContextProvider>
              </ClusterDefaultConfigurationProvider>
            </ModalDialogsContextProvider>
          </SentryErrorMonitorContextProvider>
        </AlertsContextProvider>
      </ClusterWizardContextProvider>
    );
  }

  return <Navigate to="/clusters" />;
};

export const ClusterPage = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  return (
    <AlertsContextProvider>
      <ClusterPageGeneric clusterId={clusterId || ''} showBreadcrumbs />
    </AlertsContextProvider>
  );
};
