import { useCluster } from '../hooks/useCluster';
import {
  AlertsContextProvider,
  CpuArchitecture,
  ErrorState,
  ResourceUIState,
} from '@openshift-assisted/ui-lib/common';
import {
  ClusterLoading,
  ClusterWizardContextProvider,
  useClusterPolling,
  ClusterWizard,
  useInfraEnv,
  ModalDialogsContextProvider,
  ClusterDefaultConfigurationProvider,
  ClusterUiError,
  OpenshiftVersionsContextProvider,
  NewFeatureSupportLevelProvider,
  NewClusterWizard,
} from '@openshift-assisted/ui-lib/ocm';
import { Alert, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

export const EditClusterWizard = () => {
  const { clusterId } = useParams() as { clusterId: string };
  const { cluster, uiState, errorDetail } = useClusterPolling(clusterId);
  const pullSecret = '';
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

  if (uiState === ResourceUIState.POLLING_ERROR || infraEnvError || !cluster || !infraEnv) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState
          title="Failed to fetch the cluster"
          content={errorDetail?.message || infraEnvError}
        />
      </PageSection>
    );
  }

  return (
    <AlertsContextProvider>
      <ModalDialogsContextProvider>
        <ClusterDefaultConfigurationProvider
          loadingUI={<ClusterLoading />}
          errorUI={<ClusterUiError />}
        >
          <OpenshiftVersionsContextProvider>
            <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
              <PageSection variant={PageSectionVariants.light}>
                <ClusterWizardContextProvider
                  cluster={cluster}
                  infraEnv={infraEnv}
                  isDisconnectedMode={true}
                >
                  <ClusterWizard
                    cluster={cluster}
                    infraEnv={infraEnv}
                    updateInfraEnv={updateInfraEnv}
                  />
                </ClusterWizardContextProvider>
              </PageSection>
            </NewFeatureSupportLevelProvider>
          </OpenshiftVersionsContextProvider>
        </ClusterDefaultConfigurationProvider>
      </ModalDialogsContextProvider>
    </AlertsContextProvider>
  );
};

export const CreateClusterWizard = () => {
  const [clusterId, isLoading, error] = useCluster();
  const navigate = useNavigate();
  if (isLoading) {
    return <ClusterLoading />;
  }

  if (error) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Alert isInline variant="danger" title="Failed to fetch clusters" />
      </PageSection>
    );
  }

  if (clusterId) {
    navigate(`/${clusterId}`);
  }

  return (
    <AlertsContextProvider>
      <ClusterWizardContextProvider isDisconnectedMode={true}>
        <OpenshiftVersionsContextProvider>
          <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
            <NewClusterWizard />
          </NewFeatureSupportLevelProvider>
        </OpenshiftVersionsContextProvider>
      </ClusterWizardContextProvider>
    </AlertsContextProvider>
  );
};
