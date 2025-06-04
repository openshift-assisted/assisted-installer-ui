import { useCluster } from '../hooks/useCluster';
import { AlertsContextProvider } from '@openshift-assisted/ui-lib/common';
import {
  ClusterLoading,
  ClusterWizardContextProvider,
  OpenShiftVersionsContextProvider,
  NewFeatureSupportLevelProvider,
  NewClusterWizard,
  ModalDialogsContextProvider,
} from '@openshift-assisted/ui-lib/ocm';
import { Alert, PageSection,  } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom-v5-compat';
import ResetSingleClusterModal from './ResetSingleClusterModal';

const CreateClusterWizard = () => {
  const [clusterId, isLoading, error] = useCluster();
  const navigate = useNavigate();
  if (isLoading) {
    return <ClusterLoading />;
  }

  if (error) {
    return (
      <PageSection hasBodyWrapper={false}  isFilled>
        <Alert isInline variant="danger" title="Failed to fetch clusters" />
      </PageSection>
    );
  }

  if (clusterId) {
    navigate(`/${clusterId}`);
  }

  return (
    <AlertsContextProvider>
      <ClusterWizardContextProvider>
        <ModalDialogsContextProvider>
          <OpenShiftVersionsContextProvider>
            <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
              <NewClusterWizard />
              <ResetSingleClusterModal />
            </NewFeatureSupportLevelProvider>
          </OpenShiftVersionsContextProvider>
        </ModalDialogsContextProvider>
      </ClusterWizardContextProvider>
    </AlertsContextProvider>
  );
};

export default CreateClusterWizard;
