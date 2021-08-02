import React from 'react';
import { Formik } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';
import { Lazy } from 'yup';

import { getFormikErrorFields, useAlerts, ClusterWizardStepHeader } from '../../../common';

import {
  ClusterDeploymentDetailsNetworkingProps,
  ClusterDeploymentNetworkingValues,
} from './types';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import { getHostSubnets } from '../../../common/components/clusterConfiguration/utils';
import {
  getNetworkConfigurationValidationSchema,
  getNetworkInitialValues,
} from '../../../common/components/clusterConfiguration';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentNetworkingForm, {
  defaultNetworkSettings,
} from './ClusterDeploymentNetworkingForm';
import { getAICluster } from '../helpers';

type UseNetworkingFormikArgs = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  pullSecretSet: boolean;
};

export const useNetworkingFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
}: UseNetworkingFormikArgs): [ClusterDeploymentNetworkingValues, Lazy] => {
  const initialValues = React.useMemo(
    () => {
      const cluster = getAICluster({
        clusterDeployment,
        agentClusterInstall,
        agents,
        pullSecretSet,
      });
      return getNetworkInitialValues(cluster, defaultNetworkSettings);
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(() => {
    const cluster = getAICluster({
      clusterDeployment,
      agentClusterInstall,
      agents,
      pullSecretSet,
    });
    const hostSubnets = getHostSubnets(cluster);
    return getNetworkConfigurationValidationSchema(initialValues, hostSubnets);
  }, [initialValues, clusterDeployment, agentClusterInstall, agents, pullSecretSet]);
  return [initialValues, validationSchema];
};

const ClusterDeploymentNetworkingStep: React.FC<ClusterDeploymentDetailsNetworkingProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  pullSecretSet,
  onSaveNetworking,
  onClose,
  ...rest
}) => {
  const { addAlert } = useAlerts();
  // TODO(mlibra) - see bellow const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const [initialValues, validationSchema] = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents,
    pullSecretSet,
  });

  const handleSubmit = async (values: ClusterDeploymentNetworkingValues) => {
    try {
      await onSaveNetworking(values);
    } catch (error) {
      addAlert({
        title: 'Failed to save ClusterDeployment',
        message: error,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, isValidating, dirty, errors, touched }) => {
        const handleOnNext = () => {
          if (dirty) {
            submitForm();
          }
          // TODO(mlibra): check behaviour if submit fails, no transition in that case
          // setCurrentStepId('something-next'); // TODO(mlibra): set next step ID here
          onClose(); // TODO(mlibra): just temporarily - the flow will continue
        };

        const footer = (
          <ClusterDeploymentWizardFooter
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onNext={handleOnNext}
            onCancel={onClose}
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader>Networking</ClusterWizardStepHeader>
              </GridItem>
              <GridItem>
                <ClusterDeploymentNetworkingForm
                  clusterDeployment={clusterDeployment}
                  agentClusterInstall={agentClusterInstall}
                  agents={agents}
                  pullSecretSet={pullSecretSet}
                  {...rest}
                />
              </GridItem>
            </Grid>
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentNetworkingStep;
