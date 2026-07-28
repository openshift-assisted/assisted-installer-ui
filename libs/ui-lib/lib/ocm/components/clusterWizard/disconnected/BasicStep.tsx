import * as React from 'react';
import { ClusterWizardStep, TechnologyPreview, StaticTextField } from '../../../../common';
import { Flex, Grid, GridItem, Form, Content } from '@patternfly/react-core';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import InstallDisconnectedSwitch from './InstallDisconnectedSwitch';

export const DISCONNECTED_OPENSHIFT_VERSION = '4.21';

const BasicStep = () => {
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
              <TechnologyPreview />
              <InstallDisconnectedSwitch />
              <span>I'm installing on a disconnected/air-gapped/secured environment</span>
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

export default BasicStep;
