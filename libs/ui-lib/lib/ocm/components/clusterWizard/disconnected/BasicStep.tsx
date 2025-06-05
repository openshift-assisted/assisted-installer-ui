import * as React from 'react';
import {
  ClusterWizardStep,
  ExternalLink,
  OCP_RELEASES_PAGE,
  StaticTextField,
  TechnologyPreview,
  useTranslation,
} from '../../../../common';
import {
  Switch,
  Split,
  SplitItem,
  TextContent,
  Text,
  TextVariants,
  Alert,
  Grid,
  GridItem,
  Form,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import OcmOpenShiftVersion from '../../clusterConfiguration/OcmOpenShiftVersion';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';

const BasicStep = () => {
  const { t } = useTranslation();
  const { installDisconnected, setInstallDisconnected, moveNext, moveBack } =
    useClusterWizardContext();

  return (
    //eslint-disable-next-line @typescript-eslint/no-empty-function
    <Formik initialValues={{}} onSubmit={() => {}}>
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={<ClusterWizardFooter onNext={moveNext} onBack={moveBack} />}
      >
        <WithErrorBoundary title="Failed to load Basic step">
          <Grid hasGutter>
            <GridItem>
              <Split>
                <SplitItem>
                  <TextContent>
                    <Text component={TextVariants.h2}>Basic information</Text>
                  </TextContent>
                </SplitItem>
                <SplitItem>
                  <TechnologyPreview />
                </SplitItem>
              </Split>
            </GridItem>
            <GridItem>
              <Switch
                id="disconnected-install-switch"
                label="I'm installing on a disconnected/air-gapped/secured environment"
                isChecked={installDisconnected}
                onChange={(_, checked) => setInstallDisconnected(checked)}
                ouiaId="DisconnectedInstall"
              />
            </GridItem>
            <GridItem>
              <Alert
                isInline
                variant="info"
                title="What installing on disconnected environment means"
              />
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
