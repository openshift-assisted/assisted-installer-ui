import React from 'react';
import { PageSectionVariants, PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '../../../common';
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
                <PageSection variant={PageSectionVariants.light}>
                  <AssistedInstallerHeader />
                </PageSection>
                <PageSection variant={PageSectionVariants.light} isFilled>
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
