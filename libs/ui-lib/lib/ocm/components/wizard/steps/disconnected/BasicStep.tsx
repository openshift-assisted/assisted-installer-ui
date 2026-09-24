import * as React from 'react';
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
};

const BasicStepForm: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting }) => {
  const { submitForm } = useFormikContext<BasicStepValues>();

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          isSubmitting={isSubmitting}
          isNextDisabled={isSubmitting}
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
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const BasicStep = () => {
  const {
    moveNext,
    hostsNetworkConfigurationType,
    disconnectedCluster,
    setDisconnectedCluster,
    disconnectedInfraEnv,
    setDisconnectedInfraEnv,
  } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const defaultPullSecret = usePullSecret();

  const initialValues: BasicStepValues = {
    hostsNetworkConfigurationType,
  };

  const handleNext = React.useCallback(
    async (values: BasicStepValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        const isStatic =
          values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC;

        // Static IP steps need an infraEnv before navigation; DHCP creates it on Optional.
        if (isStatic) {
          let infraEnvToUse = disconnectedInfraEnv;

          if (!disconnectedCluster?.id || !infraEnvToUse?.id) {
            const { data: cluster } = await ClustersAPI.registerDisconnected({
              name: DISCONNECTED_CLUSTER_NAME,
              openshiftVersion: DISCONNECTED_OPENSHIFT_VERSION,
            });
            setDisconnectedCluster(cluster);

            const { data: createdInfraEnv } = await InfraEnvsAPI.register({
              name: 'disconnected-infra-env',
              pullSecret: defaultPullSecret ?? '',
              clusterId: cluster.id,
              imageType: DISCONNECTED_IMAGE_TYPE,
              openshiftVersion: DISCONNECTED_OPENSHIFT_VERSION,
              staticNetworkConfig: getDummyInfraEnvField(),
            });
            infraEnvToUse = createdInfraEnv;
          } else if (!getStaticNetworkConfig(infraEnvToUse)) {
            const { data: updatedInfraEnv } = await InfraEnvsAPI.update(infraEnvToUse.id, {
              staticNetworkConfig: getDummyInfraEnvField(),
            });
            infraEnvToUse = updatedInfraEnv;
          }

          setDisconnectedInfraEnv(infraEnvToUse);
        } else if (disconnectedInfraEnv?.id && disconnectedInfraEnv.staticNetworkConfig) {
          const { data: updatedInfraEnv } = await InfraEnvsAPI.update(disconnectedInfraEnv.id, {
            staticNetworkConfig: [],
          });
          setDisconnectedInfraEnv(updatedInfraEnv);
        }

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
      onSubmit={(values) => void handleNext(values)}
      enableReinitialize
    >
      <BasicStepForm isSubmitting={isSubmitting} />
    </Formik>
  );
};

export default BasicStep;
