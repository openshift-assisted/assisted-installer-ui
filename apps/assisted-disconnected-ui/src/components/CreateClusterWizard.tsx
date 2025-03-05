import { useCluster } from '../hooks/useCluster';
import { AlertsContextProvider } from '@openshift-assisted/ui-lib/common';
import {
  ClusterLoading,
  ClusterWizardContextProvider,
  OpenshiftVersionsContextProvider,
  NewFeatureSupportLevelProvider,
  NewClusterWizard,
} from '@openshift-assisted/ui-lib/ocm';
import { Alert, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom-v5-compat';

const CreateClusterWizard = () => {
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
      <ClusterWizardContextProvider>
        <OpenshiftVersionsContextProvider>
          <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
            <NewClusterWizard />
          </NewFeatureSupportLevelProvider>
        </OpenshiftVersionsContextProvider>
      </ClusterWizardContextProvider>
    </AlertsContextProvider>
  );
};

export default CreateClusterWizard;
