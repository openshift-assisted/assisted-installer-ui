import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '../../../common';
import {
  ModalDialogsContextProvider,
  ClusterLoading,
  ClusterPageError,
  NewFeatureSupportLevelProvider,
  ClusterWizardContextProvider,
  NewClusterWizard,
  AssistedInstallerHeader,
  ClusterBreadcrumbs,
} from '../../components';
import {
  ClusterDefaultConfigurationProvider,
  OpenShiftVersionsContextProvider,
  SentryErrorMonitorContextProvider,
} from '../../contexts';

export const NewClusterPage = () => {
  return (
    <AlertsContextProvider>
      <SentryErrorMonitorContextProvider>
        <ModalDialogsContextProvider>
          <ClusterDefaultConfigurationProvider
            loadingUI={<ClusterLoading />}
            errorUI={<ClusterPageError />}
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
