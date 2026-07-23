import * as React from 'react';
import {
  ClusterWizardStep,
  TechnologyPreview,
  StaticTextField,
  useTranslation,
} from '../../../../common';
import { getDefaultOpenShiftVersion } from '../../../../common/components/ui/formik/utils';
import { Flex, Grid, GridItem, Form, Content } from '@patternfly/react-core';
import OcmOpenShiftVersionSelect from '../../clusterConfiguration/OcmOpenShiftVersionSelect';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import InstallDisconnectedSwitch from './InstallDisconnectedSwitch';
import { Formik, useFormikContext } from 'formik';
import { useOpenShiftVersionsContext } from '../OpenShiftVersionsContext';

type BasicStepFormikValues = {
  openshiftVersion: string;
  customOpenshiftSelect: string | null;
};

const VersionSyncEffect = () => {
  const { values } = useFormikContext<BasicStepFormikValues>();
  const { setDisconnectedOpenshiftVersion } = useClusterWizardContext();
  React.useEffect(() => {
    if (values.openshiftVersion) {
      setDisconnectedOpenshiftVersion(values.openshiftVersion);
    }
  }, [values.openshiftVersion, setDisconnectedOpenshiftVersion]);
  return null;
};

const BasicStep = () => {
  const { t } = useTranslation();
  const { moveNext, disconnectedOpenshiftVersion } = useClusterWizardContext();
  const { latestVersions } = useOpenShiftVersionsContext();
  const initialVersion =
    disconnectedOpenshiftVersion || getDefaultOpenShiftVersion(latestVersions);

  return (
    <Formik<BasicStepFormikValues>
      initialValues={{ openshiftVersion: initialVersion, customOpenshiftSelect: null }}
      enableReinitialize
      onSubmit={() => {
        // nothing to do
      }}
    >
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={<ClusterWizardFooter onNext={moveNext} />}
      >
        <VersionSyncEffect />
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
                <OcmOpenShiftVersionSelect />
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
