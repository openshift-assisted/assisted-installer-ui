import * as React from 'react';
import {
  ClusterWizardStep,
  DeveloperPreview,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  useTranslation,
} from '../../../../common';
import { Split, SplitItem, Grid, GridItem, Form, Content } from '@patternfly/react-core';
import OcmOpenShiftVersion from '../../clusterConfiguration/OcmOpenShiftVersion';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import InstallDisconnectedSwitch from './InstallDisconnectedSwitch';
import { Formik } from 'formik';

const BasicStep = () => {
  const { t } = useTranslation();
  const { moveNext } = useClusterWizardContext();

  return (
    <Formik
      initialValues={{}}
      onSubmit={() => {
        // nothing to do
      }}
    >
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={<ClusterWizardFooter onNext={moveNext} />}
      >
        <WithErrorBoundary title="Failed to load Basic step">
          <Grid hasGutter>
            <GridItem>
              <Split>
                <SplitItem>
                  <Content>
                    <Content component="h2">Basic information</Content>
                  </Content>
                </SplitItem>
                <SplitItem>
                  <DeveloperPreview />
                </SplitItem>
              </Split>
            </GridItem>
            <GridItem>
              <InstallDisconnectedSwitch />
            </GridItem>
            <GridItem>
              <Form id="wizard-cluster-basic-info__form">
                <OcmOpenShiftVersion openshiftVersion="4.19" withPreviewText withMultiText>
                  <ExternalLink href={`${window.location.origin}/${OCP_RELEASES_PAGE}`}>
                    <span data-ouia-id="openshift-releases-link">
                      {t('ai:Learn more about OpenShift releases')}
                    </span>
                  </ExternalLink>
                </OcmOpenShiftVersion>
                <StaticTextField name="cpuArchitecture" label="CPU architecture" isRequired>
                  x86_64
                </StaticTextField>
              </Form>
            </GridItem>
          </Grid>
        </WithErrorBoundary>
      </ClusterWizardStep>
    </Formik>
  );
};

export default BasicStep;
