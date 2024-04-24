import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core';
import {
  AddHostsContextProvider,
  AlertsContextProvider,
  CpuArchitecture,
  ErrorState,
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
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';
import useInfraEnv from '../../hooks/useInfraEnv';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
import { forceReload } from '../../store/slices/current-cluster/slice';
import { ClusterUiError } from './ClusterPageErrors';
import ClusterLoading from './ClusterLoading';
import ClusterPollingErrorModal from '../clusterDetail/ClusterPollingErrorModal';
import ClusterUpdateErrorModal from '../clusterDetail/ClusterUpdateErrorModal';
import { BackButton } from '../ui/Buttons/BackButton';
import { NewFeatureSupportLevelProvider } from '../featureSupportLevels';
import { usePullSecret } from '../../hooks';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { AssistedInstallerHeader } from './AssistedInstallerHeader';

const ClusterPageGeneric = ({
  clusterId,
  showBreadcrumbs = false,
}: {
  clusterId: string;
  showBreadcrumbs?: boolean;
}) => {
  if (!clusterId) {
    // console.error('ClusterPageGeneric: missing clusterId');
  }
  const fetchCluster = useFetchCluster(clusterId);
  const dispatch = useDispatch();
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

  const getContent = (cluster: Cluster, infraEnv: InfraEnv) => {
    if (cluster.status === 'adding-hosts') {
      const onReset = async () => {
        dispatch(forceReload());
        return Promise.resolve();
      };
      return (
        <AddHostsContextProvider cluster={cluster} resetCluster={onReset}>
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
          {showBreadcrumbs && <ClusterBreadcrumbs clusterName={cluster.name} />}
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
          {showBreadcrumbs && <ClusterBreadcrumbs clusterName={cluster.name} />}
          {showBreadcrumbs && (
            <PageSection variant={PageSectionVariants.light}>
              <AssistedInstallerHeader />
            </PageSection>
          )}

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
          title="Cluster details not found"
          actions={[<BackButton key={'cancel'} to={`${routeBasePath}/clusters`} />]}
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
                <NewFeatureSupportLevelProvider
                  loadingUi={<ClusterLoading />}
                  cluster={cluster}
                  cpuArchitecture={infraEnv.cpuArchitecture as CpuArchitecture}
                  openshiftVersion={cluster.openshiftVersion}
                  platformType={cluster.platform?.type}
                >
                  {/* TODO(mlibra): Will be reworked within https://issues.redhat.com/browse/AGENT-522
                <RebootNodeZeroModal cluster={cluster} />
                */}
                  {getContent(cluster, infraEnv)}
                  {uiState === ResourceUIState.POLLING_ERROR && <ClusterPollingErrorModal />}
                  {uiState === ResourceUIState.UPDATE_ERROR && <ClusterUpdateErrorModal />}
                  <CancelInstallationModal />
                  <ResetClusterModal />
                  <DiscoveryImageModal />
                </NewFeatureSupportLevelProvider>
              </ClusterDefaultConfigurationProvider>
            </ModalDialogsContextProvider>
          </SentryErrorMonitorContextProvider>
        </AlertsContextProvider>
      </ClusterWizardContextProvider>
    );
  }

  return <Redirect to="/clusters" />;
};

export const SingleClusterPage = ({ clusterId }: { clusterId: string }) => (
  <AlertsContextProvider>
    <ClusterPageGeneric clusterId={clusterId} />
  </AlertsContextProvider>
);

export const ClusterPage = () => {
  const { clusterId } = useParams<{ clusterId: string }>();
  return (
    <AlertsContextProvider>
      <ClusterPageGeneric clusterId={clusterId || ''} showBreadcrumbs />
    </AlertsContextProvider>
  );
};
