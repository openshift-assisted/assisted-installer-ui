import React from 'react';
import * as _ from 'lodash';
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
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import { getAICluster } from '../helpers';
import ClusterDeploymentNetworkingForm, {
  defaultNetworkSettings,
} from './ClusterDeploymentNetworkingForm';

type UseNetworkingFormikArgs = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
};

export const useNetworkingFormik = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
}: UseNetworkingFormikArgs): [ClusterDeploymentNetworkingValues, Lazy] => {
  const initialValues = React.useMemo(
    () => {
      const cluster = getAICluster({
        clusterDeployment,
        agentClusterInstall,
        agents,
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
    });
    const hostSubnets = getHostSubnets(cluster);
    return getNetworkConfigurationValidationSchema(initialValues, hostSubnets);
  }, [initialValues, clusterDeployment, agentClusterInstall, agents]);
  return [initialValues, validationSchema];
};

const ClusterDeploymentNetworkingStep: React.FC<ClusterDeploymentDetailsNetworkingProps> = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onSaveNetworking,
  onClose,
  ...rest
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const matchingAgents = agents.filter((a) =>
    _.isMatch(
      a.metadata?.labels || {},
      clusterDeployment.spec?.platform.agentBareMetal.agentSelector?.matchLabels || {},
    ),
  );

  const [initialValues, validationSchema] = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents: matchingAgents,
  });

  const next = () => {
    // setCurrentStepId('something-next'); // TODO(mlibra): set the next step ID here
    onClose(); // TODO(mlibra): just temporarily - the flow will continue
  };

  const handleSubmit = async (values: ClusterDeploymentNetworkingValues) => {
    try {
      await onSaveNetworking(values);
      next();
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
          } else {
            next();
          }
        };

        const footer = (
          <ClusterDeploymentWizardFooter
            errorFields={getFormikErrorFields(errors, touched)}
            isSubmitting={isSubmitting}
            isNextDisabled={!isValid || isValidating || isSubmitting}
            onNext={handleOnNext}
            onBack={() => setCurrentStepId('hosts-selection')}
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
                  agents={matchingAgents}
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
