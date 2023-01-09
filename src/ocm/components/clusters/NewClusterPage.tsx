import React from 'react';
import { PageSectionVariants, TextContent, Text, PageSection } from '@patternfly/react-core';
import { AlertsContextProvider } from '../../../common';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import NewClusterWizard from '../clusterWizard/NewClusterWizard';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
import ClusterLoading from './ClusterLoading';
import { ClusterUiError } from './ClusterPageErrors';

const NewClusterPage = () => {
  return (
    <AlertsContextProvider>
      <SentryErrorMonitorContextProvider>
        <ClusterDefaultConfigurationProvider
          loadingUI={<ClusterLoading />}
          errorUI={<ClusterUiError />}
        >
          <FeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
            <ClusterBreadcrumbs clusterName="New cluster" />
            <PageSection variant={PageSectionVariants.light}>
              <TextContent>
                <Text component="h1" className="pf-u-display-inline">
                  Install OpenShift with the Assisted Installer
                </Text>
              </TextContent>
            </PageSection>
            <PageSection variant={PageSectionVariants.light} isFilled>
              <ClusterWizardContextProvider>
                <NewClusterWizard />
              </ClusterWizardContextProvider>
            </PageSection>
          </FeatureSupportLevelProvider>
        </ClusterDefaultConfigurationProvider>
      </SentryErrorMonitorContextProvider>
    </AlertsContextProvider>
  );
};

export default NewClusterPage;
