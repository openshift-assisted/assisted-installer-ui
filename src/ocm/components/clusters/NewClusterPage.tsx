import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageSectionVariants,
  TextContent,
  Text,
  Button,
  ButtonVariant,
  PageSection,
} from '@patternfly/react-core';
import { AlertsContextProvider, ErrorState, LoadingState } from '../../../common';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import NewClusterWizard from '../clusterWizard/NewClusterWizard';
import { routeBasePath } from '../../config';
import { FeatureSupportLevelProvider } from '../featureSupportLevels';
import ClusterWizardContextProvider from '../clusterWizard/ClusterWizardContextProvider';
import { SentryErrorMonitorContextProvider } from '../SentryErrorMonitorContextProvider';
const loadingUI = (
  <PageSection variant={PageSectionVariants.light} isFilled>
    <LoadingState />
  </PageSection>
);

const errorUI = (
  <PageSection variant={PageSectionVariants.light} isFilled>
    <ErrorState
      title="Failed to retrieve the default configuration"
      actions={[
        <Button
          key="cancel"
          variant={ButtonVariant.secondary}
          component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
        >
          Back
        </Button>,
      ]}
    />
  </PageSection>
);

const NewClusterPage: React.FC = () => {
  return (
    <AlertsContextProvider>
      <SentryErrorMonitorContextProvider>
        <ClusterDefaultConfigurationProvider loadingUI={loadingUI} errorUI={errorUI}>
          <FeatureSupportLevelProvider loadingUi={loadingUI}>
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
