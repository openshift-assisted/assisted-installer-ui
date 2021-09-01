import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { getFormikErrorFields, useAlerts } from '../../../common';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import ClusterDeploymentHostsSelection from './ClusterDeploymentHostsSelection';
import {
  ClusterDeploymentHostSelectionStepProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import { hostCountValidationSchema, hostLabelsValidationSchema } from './validationSchemas';
import { getAgentSelectorFieldsFromAnnotations, getAgentStatus } from '../helpers';

const getInitialValues = ({
  clusterDeployment,
  agentClusterInstall,
  selectedHostIds,
}: {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  // agents: AgentK8sResource[];
  selectedHostIds: string[];
}): ClusterDeploymentHostsSelectionValues => {
  const isSNOCluster = agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents === 1;

  let hostCount =
    (agentClusterInstall?.spec?.provisionRequirements?.controlPlaneAgents || 0) +
    (agentClusterInstall?.spec?.provisionRequirements?.workerAgents || 0);
  if (isSNOCluster) {
    hostCount = 1;
  } else if (hostCount === 2 || hostCount === 0) {
    hostCount = 3;
  } else if (hostCount === 4) {
    hostCount = 5;
  }

  const agentSelector = getAgentSelectorFieldsFromAnnotations(
    clusterDeployment?.metadata?.annotations,
  );

  // false if we have additional agent-labels set
  const autoSelectHosts = !agentSelector?.labels?.length;
  // !agentSelector?.matchLabels || !Object.keys(agentSelector.matchLabels).length;

  return {
    autoSelectHosts,
    hostCount,
    useMastersAsWorkers: hostCount === 1 || hostCount === 3, // TODO: Recently not supported - https://issues.redhat.com/browse/MGMT-7677
    agentLabels: agentSelector?.labels || [], // labelsToArray(agentSelector?.matchLabels),
    locations: agentSelector?.locations || [], // getLocationsFromMatchExpressions(agentSelector?.matchExpressions),
    selectedHostIds,

    // Read-only, hidden for the user, not meant to be modified by the form
    isSNOCluster,
  };
};

const getValidationSchema = () =>
  Yup.object().shape({
    hostCount: hostCountValidationSchema,
    useMastersAsWorkers: Yup.boolean().required(),
    agentLabels: hostLabelsValidationSchema,
    locations: Yup.array().min(1),
  });

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  // agents,
  selectedHostIds,
  matchingAgents: unfilteredMatchingAgents,
  onClose,
  onSaveHostsSelection,
  ...rest
}) => {
  const { addAlert } = useAlerts();
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);

  const initialValues = React.useMemo(
    () => getInitialValues({ clusterDeployment, agentClusterInstall, selectedHostIds }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const validationSchema = React.useMemo(() => getValidationSchema(), []);

  // Use Ready hosts only
  const matchingAgents = React.useMemo(
    () =>
      (unfilteredMatchingAgents || []).filter((agent) => {
        const [status] = getAgentStatus(agent);
        return (
          true ||
          [
            'known',
            /* insufficient should be good for this step, a role has to be selected first */ 'insufficient',
          ].includes(status)
        ); // DO NOT MERGE: remove "true" for here - debugging only
      }),
    [unfilteredMatchingAgents],
  );

  const next = () => setCurrentStepId('networking');
  const handleSubmit = async (values: ClusterDeploymentHostsSelectionValues) => {
    try {
      const params = { ...values };
      if (values.autoSelectHosts) {
        // TODO(mlibra): Hosts do not need to be reallocated everytime
        const selectedAgents = matchingAgents.splice(0, params.hostCount);
        params.selectedHostIds = selectedAgents.map((agent) => agent.metadata?.uid || '');

        if (params.selectedHostIds.length !== params.hostCount) {
          throw 'Host auto-selection failed. Can not allocate the requested host count.';
        }
      }

      await onSaveHostsSelection(params);
      next();
    } catch (error) {
      addAlert({
        title: 'Failed to save host selection.',
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
            onBack={() => setCurrentStepId('cluster-details')}
            onCancel={onClose}
          />
        );
        const navigation = <ClusterDeploymentWizardNavigation />;

        return (
          <ClusterDeploymentWizardStep navigation={navigation} footer={footer}>
            <ClusterDeploymentHostsSelection {...rest} matchingAgents={matchingAgents} />
          </ClusterDeploymentWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDeploymentHostSelectionStep;
