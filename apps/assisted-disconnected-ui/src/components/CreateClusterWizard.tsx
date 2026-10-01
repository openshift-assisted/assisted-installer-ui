import { useCluster } from '../hooks/useCluster';
import { AlertsContextProvider } from '@openshift-assisted/ui-lib/common';
import {
  ClusterLoading,
  ClusterWizardContextProvider,
  OpenShiftVersionsContextProvider,
  NewFeatureSupportLevelProvider,
  NewClusterWizard,
  ModalDialogsContextProvider,
  useClusterWizardContext,
} from '@openshift-assisted/ui-lib/ocm';
import { Alert, PageSection } from '@patternfly/react-core';
import { useNavigate } from 'react-router';
import ResetSingleClusterModal from './ResetSingleClusterModal';

const DisconnectedWizardContent = () => {
  const { disconnectedOpenshiftVersion } = useClusterWizardContext();

  return (
    <NewFeatureSupportLevelProvider
      loadingUi={<ClusterLoading />}
      openshiftVersion={disconnectedOpenshiftVersion}
    >
      <NewClusterWizard />
      <ResetSingleClusterModal />
    </NewFeatureSupportLevelProvider>
  );
};

const CreateClusterWizard = () => {
  const [clusterId, isLoading, error] = useCluster();
  const navigate = useNavigate();
  if (isLoading) {
    return <ClusterLoading />;
  }

  if (error) {
    return (
      <PageSection hasBodyWrapper={false} isFilled>
        <Alert isInline variant="danger" title="Failed to fetch clusters" />
      </PageSection>
    );
  }

  if (clusterId) {
    void navigate(`/${clusterId}`);
  }

  return (
    <AlertsContextProvider>
      <ClusterWizardContextProvider>
        <ModalDialogsContextProvider>
          <OpenShiftVersionsContextProvider>
            <DisconnectedWizardContent />
          </OpenShiftVersionsContextProvider>
        </ModalDialogsContextProvider>
      </ClusterWizardContextProvider>
    </AlertsContextProvider>
  );
};

export default CreateClusterWizard;
