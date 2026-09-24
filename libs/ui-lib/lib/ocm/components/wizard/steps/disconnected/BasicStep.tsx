import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { AlertVariant, Grid, GridItem, Content, Flex, Form } from '@patternfly/react-core';
import { ImageType } from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStep,
  StaticTextField,
  WithErrorBoundary,
  useAlerts,
  ClustersAPI,
  InfraEnvsAPI,
  handleApiError,
  getApiErrorMessage,
  isInOcm,
  PullSecret,
  pullSecretValidationSchema,
  useTranslation,
  getFormikErrorFields,
} from '../../../../../common';
import { usePullSecret } from '../../../../hooks';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { HostsNetworkConfigurationControlGroup } from '../clusterDetails/fields/HostsNetworkConfigurationControlGroup';
import { HostsNetworkConfigurationType } from '../../../../services/types';
import { getDummyInfraEnvField } from '../staticIp/data/dummyData';
import { getStaticNetworkConfig } from '../staticIp/data/fromInfraEnv';
import { InstallDisconnectedSwitch } from './InstallDisconnectedSwitch';

export const DISCONNECTED_OPENSHIFT_VERSION = '4.22.13';

const DISCONNECTED_IMAGE_TYPE: ImageType = 'disconnected-iso';
const DISCONNECTED_CLUSTER_NAME = 'disconnected-cluster';

type BasicStepValues = {
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
  pullSecret: string;
};

const BasicStepForm: React.FC<{
  isSubmitting: boolean;
  defaultPullSecret?: string;
}> = ({ isSubmitting, defaultPullSecret }) => {
  const { submitForm, isValid, errors, touched } = useFormikContext<BasicStepValues>();
  const errorFields = getFormikErrorFields(errors, touched);

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          isSubmitting={isSubmitting}
          isNextDisabled={!isValid || isSubmitting}
          errorFields={errorFields}
        />
      }
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
              <HostsNetworkConfigurationControlGroup clusterExists={false} isDisabled={false} />
              {!isInOcm && <PullSecret isOcm={false} defaultPullSecret={defaultPullSecret} />}
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const BasicStep = () => {
  const { t } = useTranslation();
  const {
    moveNext,
    disconnectedCluster,
    setDisconnectedCluster,
    disconnectedInfraEnv,
    setDisconnectedInfraEnv,
  } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const defaultPullSecret = usePullSecret();

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        pullSecret: isInOcm ? Yup.string() : pullSecretValidationSchema(t),
      }),
    [t],
  );

  const initialValues: BasicStepValues = {
    hostsNetworkConfigurationType: disconnectedInfraEnv?.staticNetworkConfig
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP,
    pullSecret: defaultPullSecret ?? '',
  };

  const handleNext = React.useCallback(
    async (values: BasicStepValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        const isStatic =
          values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC;
        let infraEnvToUse = disconnectedInfraEnv;

        if (!disconnectedCluster?.id || !infraEnvToUse?.id) {
          const { data: cluster } = await ClustersAPI.registerDisconnected({
            name: DISCONNECTED_CLUSTER_NAME,
            openshiftVersion: DISCONNECTED_OPENSHIFT_VERSION,
          });
          setDisconnectedCluster(cluster);

          const pullSecret = isInOcm ? defaultPullSecret ?? '' : values.pullSecret;
          const { data: createdInfraEnv } = await InfraEnvsAPI.register({
            name: 'disconnected-infra-env',
            pullSecret,
            clusterId: cluster.id,
            imageType: DISCONNECTED_IMAGE_TYPE,
            openshiftVersion: DISCONNECTED_OPENSHIFT_VERSION,
            staticNetworkConfig: isStatic ? getDummyInfraEnvField() : undefined,
          });
          infraEnvToUse = createdInfraEnv;
        } else {
          const staticNetworkConfig = isStatic
            ? getStaticNetworkConfig(infraEnvToUse) ?? getDummyInfraEnvField()
            : [];
          const { data: updatedInfraEnv } = await InfraEnvsAPI.update(infraEnvToUse.id, {
            staticNetworkConfig,
          });
          infraEnvToUse = updatedInfraEnv;
        }

        setDisconnectedInfraEnv(infraEnvToUse);
        moveNext();
      } catch (error) {
        handleApiError(error, () => {
          addAlert({
            title: 'Failed to save basic information',
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      clearAlerts,
      defaultPullSecret,
      disconnectedCluster,
      disconnectedInfraEnv,
      setDisconnectedCluster,
      setDisconnectedInfraEnv,
      addAlert,
      moveNext,
    ],
  );

  return (
    <Formik<BasicStepValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => void handleNext(values)}
    >
      <BasicStepForm isSubmitting={isSubmitting} defaultPullSecret={defaultPullSecret} />
    </Formik>
  );
};

export default BasicStep;
