import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '../../../common';
import ClusterBreadcrumbs from '../../components/clusters/ClusterBreadcrumbs';
import { ClusterDefaultConfigurationProvider } from '../../components/clusterConfiguration/ClusterDefaultConfigurationContext';
import NewClusterWizard from '../../components/clusterWizard/NewClusterWizard';
import ClusterWizardContextProvider from '../../components/clusterWizard/ClusterWizardContextProvider';
import { SentryErrorMonitorContextProvider } from '../../components/SentryErrorMonitorContextProvider';
import ClusterLoading from '../../components/clusters/ClusterLoading';
import { ClusterUiError } from '../../components/clusters/ClusterPageErrors';
import { NewFeatureSupportLevelProvider } from '../../components/featureSupportLevels';
import { AssistedInstallerHeader } from '../../components/clusters/AssistedInstallerHeader';
import { ModalDialogsContextProvider } from '../../components/hosts/ModalDialogsContext';
import { OpenShiftVersionsContextProvider } from '../../components/clusterWizard/OpenShiftVersionsContext';

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
