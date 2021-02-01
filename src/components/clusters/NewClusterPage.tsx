import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageSectionVariants,
  TextContent,
  Text,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import { AlertsContextProvider } from '../AlertsContextProvider';
import ClusterBreadcrumbs from './ClusterBreadcrumbs';
import { ClusterDefaultConfigurationProvider } from '../clusterConfiguration/ClusterDefaultConfigurationContext';
import { ErrorState, LoadingState } from '../ui/uiState';
import NewClusterWizard from '../clusterWizard/NewClusterWizard';
import { FeatureGateContextProvider, FeatureListType } from '../../features/featureGate';
import { routeBasePath } from '../../config/constants';

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

const NewClusterPage: React.FC<{ features: FeatureListType }> = ({ features }) => {
  return (
    <AlertsContextProvider>
      <ClusterDefaultConfigurationProvider loadingUI={loadingUI} errorUI={errorUI}>
        <FeatureGateContextProvider features={features}>
          <ClusterBreadcrumbs clusterName="New cluster" />
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1">
                Install OpenShift on Bare Metal with the Assisted Installer
              </Text>
            </TextContent>
          </PageSection>
          <PageSection variant={PageSectionVariants.light} isFilled>
            <NewClusterWizard />
          </PageSection>
        </FeatureGateContextProvider>
      </ClusterDefaultConfigurationProvider>
    </AlertsContextProvider>
  );
};

export default NewClusterPage;
