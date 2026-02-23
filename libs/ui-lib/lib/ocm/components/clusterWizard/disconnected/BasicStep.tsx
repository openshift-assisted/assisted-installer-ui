import * as React from 'react';
import {
  ClusterWizardStep,
  TechnologyPreview,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  useTranslation,
} from '../../../../common';
import { Flex, Grid, GridItem, Form, Content, Spinner } from '@patternfly/react-core';
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
              <Content component="h2">Basic information</Content>
            </GridItem>
            <GridItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <TechnologyPreview />
                <InstallDisconnectedSwitch />
                <span>
                  {t("ai:I'm installing on a disconnected/air-gapped/secured environment")}
                </span>
              </Flex>
            </GridItem>
            <GridItem>
              <Form id="wizard-cluster-basic-info__form">
                <OcmOpenShiftVersion openshiftVersion="4.20" withPreviewText withMultiText>
                  <ExternalLink href={`${window.location.origin}/${OCP_RELEASES_PAGE}`}>
                    <span data-ouia-id="openshift-releases-link">
                      {t('ai:Learn more about OpenShift releases')}
                    </span>
                  </ExternalLink>
                </OcmOpenShiftVersion>
              ) : (
                <OcmOpenShiftVersionSelect minVersionAllowed={4021} />
              )}
              <StaticTextField name="cpuArchitecture" label="CPU architecture" isRequired>
                x86_64
              </StaticTextField>
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

const BasicStep = () => {
  return (
    <Formik<BasicStepFormikValues>
      initialValues={{
        openshiftVersion: '',
        customOpenshiftSelect: null,
      }}
      onSubmit={() => {
        // nothing to do
      }}
    >
      <BasicStepForm />
    </Formik>
  );
};

export default BasicStep;
