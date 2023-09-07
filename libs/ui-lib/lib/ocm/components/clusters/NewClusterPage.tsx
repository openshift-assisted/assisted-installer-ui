import React, { ReactNode } from 'react';
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

const NewClusterPageGeneric: React.FC<{ pageTitleSection?: ReactNode }> = ({
  pageTitleSection,
}) => {
  return (
    <AlertsContextProvider>
      <SentryErrorMonitorContextProvider>
        <ClusterDefaultConfigurationProvider
          loadingUI={<ClusterLoading />}
          errorUI={<ClusterUiError />}
        >
          <NewFeatureSupportLevelProvider loadingUi={<ClusterLoading />}>
            {pageTitleSection}
            <PageSection variant={PageSectionVariants.light} isFilled>
              <ClusterWizardContextProvider>
                <NewClusterWizard />
              </ClusterWizardContextProvider>
            </PageSection>
          </NewFeatureSupportLevelProvider>
        </ClusterDefaultConfigurationProvider>
      </SentryErrorMonitorContextProvider>
    </AlertsContextProvider>
  );
};

const NewClusterTitleSection: React.FC = () => (
  <>
    <ClusterBreadcrumbs clusterName="New cluster" />
    <PageSection variant={PageSectionVariants.light}>
      <AssistedInstallerHeader />
    </PageSection>
  </>
);

export const NewSingleClusterPage: React.FC = () => <NewClusterPageGeneric />;
export const NewClusterPage: React.FC = () => (
  <NewClusterPageGeneric pageTitleSection={<NewClusterTitleSection />} />
);
