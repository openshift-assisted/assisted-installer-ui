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
} from '@openshift-assisted/ui-lib/ocm';
import { Alert, PageSection, PageSectionVariants } from '@patternfly/react-core';

const EditCluster = ({ clusterId }: { clusterId: string }) => {
  const { cluster, uiState, errorDetail } = useClusterPolling(clusterId);
  const pullSecret = `{
    auths: {
      'cloud.openshift.com': {
        auth: 'Zm9vYmFyOmZvbwo=',
        email: 'foo@foo.com',
      },
    },
  }`;
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

  if (uiState === ResourceUIState.LOADING || infraEnvLoading || !cluster || !infraEnv) {
    return <ClusterLoading />;
  }

  if (uiState === ResourceUIState.POLLING_ERROR || infraEnvError) {
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

const Wizard = () => {
  const [clusterId, isLoading, error] = useCluster();
  if (isLoading) {
    return <ClusterLoading />;
  }
  if (error || !clusterId) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Alert isInline variant="danger" title="No cluster available" />
      </PageSection>
    );
  }
  return <EditCluster clusterId={clusterId} />;
};

export default Wizard;
