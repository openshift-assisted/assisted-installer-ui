import * as React from 'react';
import { Formik } from 'formik';
import { Flex, Grid, GridItem, Form, Content } from '@patternfly/react-core';
import {
  ClusterWizardStep,
  TechnologyPreview,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  useTranslation,
} from '../../../../../common';
import { OcmOpenShiftVersion } from '../../wizardFields/OcmOpenShiftVersion';
import { WithErrorBoundary } from '../../../../../common/components/ErrorHandling/WithErrorBoundary';
import { InstallDisconnectedSwitch } from './InstallDisconnectedSwitch';
import { useClusterWizardContext } from '../../clusterWizardContext/ClusterWizardContext';
import { ClusterWizardNavigation } from '../../wizardComponents/ClusterWizardNavigation';
import { ClusterWizardFooter } from '../../wizardComponents/ClusterWizardFooter';

export const BasicStep = () => {
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
