import * as React from 'react';
import { Grid, GridItem, Content, Flex, Form } from '@patternfly/react-core';
import { ClusterWizardStep, StaticTextField, WithErrorBoundary } from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { InstallDisconnectedSwitch } from './InstallDisconnectedSwitch';

export const DISCONNECTED_OPENSHIFT_VERSION = '4.22.13';

export const BasicStep = () => {
  const { moveNext } = useClusterWizardContext();

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={<ClusterWizardFooter onNext={moveNext} />}
    >
      <WithErrorBoundary title="Failed to load Basic step">
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Basic information</Content>
          </GridItem>
          <GridItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <InstallDisconnectedSwitch />
            </Flex>
          </GridItem>
          <GridItem>
            <Form id="wizard-cluster-basic-info__form">
              <StaticTextField name="openshiftVersion" label="OpenShift version">
                {DISCONNECTED_OPENSHIFT_VERSION}
              </StaticTextField>
              <StaticTextField name="cpuArchitecture" label="CPU architecture">
                x86_64
              </StaticTextField>
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};
