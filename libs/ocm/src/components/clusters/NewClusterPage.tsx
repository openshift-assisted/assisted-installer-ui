import React from 'react';
import { PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '@openshift-assisted/common';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import NewClusterWizard from '../clusterWizard/NewClusterWizard';
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
import ClusterLoading from './ClusterLoading';
import { ClusterUiError } from './ClusterPageErrors';
import { NewFeatureSupportLevelProvider } from '../featureSupportLevels';
import { AssistedInstallerHeader } from './AssistedInstallerHeader';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import { OpenShiftVersionsContextProvider } from '../clusterWizard/OpenShiftVersionsContext';

const NewClusterPageGeneric = ({ children }: React.PropsWithChildren<unknown>) => {
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
                {children}
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

export const NewSingleClusterPage = () => <NewClusterPageGeneric />;
export const NewClusterPage = () => (
  <NewClusterPageGeneric>
    <ClusterBreadcrumbs clusterName="New cluster" />
  </NewClusterPageGeneric>
);
