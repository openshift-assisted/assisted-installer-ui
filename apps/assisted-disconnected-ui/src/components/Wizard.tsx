import { AlertsContextProvider } from '@openshift-assisted/ui-lib/common';
import {
  ModalDialogsContextProvider,
  OpenshiftVersionsContextProvider,
  ClusterUiError,
  ClusterDefaultConfigurationProvider,
  ClusterLoading,
  ClusterWizardContextProvider,
  NewClusterWizard,
  NewFeatureSupportLevelProvider,
} from '@openshift-assisted/ui-lib/ocm';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

const Wizard = () => {
  return (
    <AlertsContextProvider>
      <ModalDialogsContextProvider>
        <ClusterDefaultConfigurationProvider
          loadingUI={<ClusterLoading />}
          errorUI={<ClusterUiError />}
        >
          <OpenshiftVersionsContextProvider>
            <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
              <PageSection variant={PageSectionVariants.light} isFilled>
                <ClusterWizardContextProvider>
                  <NewClusterWizard />
                </ClusterWizardContextProvider>
              </PageSection>
            </NewFeatureSupportLevelProvider>
          </OpenshiftVersionsContextProvider>
        </ClusterDefaultConfigurationProvider>
      </ModalDialogsContextProvider>
    </AlertsContextProvider>
  );
};

export default Wizard;
