import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '../../../common';
import {
  ModalDialogsContextProvider,
  ClusterDefaultConfigurationProvider,
  ClusterLoading,
  ClusterUiError,
  OpenShiftVersionsContextProvider,
  NewFeatureSupportLevelProvider,
  ClusterWizardContextProvider,
  NewClusterWizard,
  AssistedInstallerHeader,
  SentryErrorMonitorContextProvider,
  ClusterBreadcrumbs,
} from '../../components';

export const NewClusterPage = () => {
  return (
    <AlertsContextProvider>
      <SentryErrorMonitorContextProvider>
        <ModalDialogsContextProvider>
          <ClusterDefaultConfigurationProvider
            loadingUI={<ClusterLoading />}
            errorUI={<ClusterUiError />}
          >
            <OpenShiftVersionsContextProvider>
              <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
                <ClusterBreadcrumbs clusterName="New cluster" />
                <PageSection hasBodyWrapper={false} isFilled>
                  <AssistedInstallerHeader />
                </PageSection>
                <PageSection hasBodyWrapper={false} isFilled>
                  <ClusterWizardContextProvider>
                    <NewClusterWizard />
                  </ClusterWizardContextProvider>
                </PageSection>
              </NewFeatureSupportLevelProvider>
            </OpenShiftVersionsContextProvider>
          </ClusterDefaultConfigurationProvider>
        </ModalDialogsContextProvider>
      </SentryErrorMonitorContextProvider>
    </AlertsContextProvider>
  );
};
