import React from 'react';
import * as Yup from 'yup';
import { TestOptionsMessage } from 'yup';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import { Alert, AlertVariant, Grid, GridItem } from '@patternfly/react-core';
import { ClusterWizardStepHeader, useAlerts } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import ClusterDeploymentHostsSelection from './ClusterDeploymentHostsSelection';
import {
  ClusterDeploymentHostSelectionStepProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import { hostCountValidationSchema } from './validationSchemas';
import {
  getAgentSelectorFieldsFromAnnotations,
  getIsSNOCluster,
  getWizardStepAgentStatus,
} from '../helpers';
import { canNextFromHostSelectionStep } from './wizardTransition';

const getInitialValues = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
}): ClusterDeploymentHostsSelectionValues => {
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

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

  const selectedIds = agents
    .filter(
      (agent) =>
        agent.spec?.clusterDeploymentName?.name === cdName &&
        agent.spec?.clusterDeploymentName?.namespace === cdNamespace,
    )
    .map((agent) => agent.metadata?.uid as string);
  const autoSelectHosts = agentSelector.autoSelect;

  return {
    autoSelectHosts,
    hostCount,
    useMastersAsWorkers: hostCount === 1 || hostCount === 3, // TODO: Recently not supported - https://issues.redhat.com/browse/MGMT-7677
    agentLabels: agentSelector?.labels || [],
    locations: agentSelector?.locations || [],
    selectedHostIds: selectedIds,
    autoSelectedHostIds: selectedIds,
  };
};

const getMinHostsCount = (selectedHostsCount: number) => (selectedHostsCount === 4 ? 5 : 3);

const getValidationSchema = (agentClusterInstall: AgentClusterInstallK8sResource) => {
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  const getMinMessage: TestOptionsMessage<{ min: number }> = ({ min }) => {
    const message = `Please select at least ${min} hosts for the cluster`;
    if (min === 5) {
      return message + ' or select just 3 hosts instead.';
    }
    return `${message}.`;
  };

  return Yup.lazy<ClusterDeploymentHostsSelectionValues>((values) => {
    return Yup.object<ClusterDeploymentHostsSelectionValues>().shape({
      hostCount: isSNOCluster ? Yup.number() : hostCountValidationSchema,
      useMastersAsWorkers: Yup.boolean().required(),
      autoSelectedHostIds: values.autoSelectHosts
        ? Yup.array<string>().min(values.hostCount).max(values.hostCount)
        : Yup.array<string>(),
      selectedHostIds: values.autoSelectHosts
        ? Yup.array<string>()
        : isSNOCluster
        ? Yup.array<string>()
            .min(0, 'Please select one host for the cluster.')
            .max(1, 'Please select one host for the cluster.') // TODO(jtomasek): replace this with Yup.array().length() after updating Yup
        : Yup.array<string>().min(getMinHostsCount(values.selectedHostIds.length), getMinMessage),
    });
  });
};

type UseHostsSelectionFormikArgs = {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
};

export const useHostsSelectionFormik = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: UseHostsSelectionFormikArgs): [ClusterDeploymentHostsSelectionValues, Yup.Lazy] => {
  const initialValues = React.useMemo(
    () => getInitialValues({ agents, clusterDeployment, agentClusterInstall }),
    [agentClusterInstall, agents, clusterDeployment],
  );

  const validationSchema = React.useMemo(() => getValidationSchema(agentClusterInstall), [
    agentClusterInstall,
  ]);

  return [initialValues, validationSchema];
};

const getSelectedAgents = (
  agents: AgentK8sResource[],
  values: ClusterDeploymentHostsSelectionValues,
) => {
  const selectedHostIds = values.autoSelectHosts
    ? values.autoSelectedHostIds
    : values.selectedHostIds;
  return agents.filter((agent) => selectedHostIds.includes(agent.metadata?.uid || ''));
};

type HostSelectionFormProps = {
  agents: ClusterDeploymentHostSelectionStepProps['agents'];
  agentClusterInstall: ClusterDeploymentHostSelectionStepProps['agentClusterInstall'];
  onClose: ClusterDeploymentHostSelectionStepProps['onClose'];
  clusterDeployment: ClusterDeploymentHostSelectionStepProps['clusterDeployment'];
  aiConfigMap?: ClusterDeploymentHostSelectionStepProps['aiConfigMap'];
  hostActions?: ClusterDeploymentHostSelectionStepProps['hostActions'];
};

const HostSelectionForm: React.FC<HostSelectionFormProps> = ({
  agents,
  agentClusterInstall,
  onClose,
  clusterDeployment,
  aiConfigMap,
  hostActions: initHostActions,
}) => {
  const { setCurrentStepId } = React.useContext(ClusterDeploymentWizardContext);
  const [showClusterErrors, setShowClusterErrors] = React.useState(false);
  const {
    values,
    isValid,
    isValidating,
    isSubmitting,
    touched,
    errors,
    validateForm,
    setTouched,
    submitForm,
    setSubmitting,
  } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const [nextRequested, setNextRequested] = React.useState(false);
  const [showFormErrors, setShowFormErrors] = React.useState(false);
  const selectedAgents = getSelectedAgents(agents, values);

  const hostActions = React.useMemo<HostSelectionFormProps['hostActions']>(() => {
    const onEditRole = initHostActions?.onEditRole;
    return {
      ...initHostActions,
      ...(onEditRole
        ? {
            onEditRole: async (agent, role) => {
              setNextRequested(false);
              setShowClusterErrors(false); //not sure we want to reset this ?
              setSubmitting(true);
              const response = await onEditRole(agent, role);
              setSubmitting(false);
              return response;
            },
          }
        : {}),
    };
  }, [initHostActions, setSubmitting]);

  const onNext = async () => {
    if (!showFormErrors) {
      setShowFormErrors(true);
      const errors = await validateForm();
      setTouched(
        Object.keys(errors).reduce((acc, curr) => {
          acc[curr] = true;
          return acc;
        }, {}),
      );
      if (Object.keys(errors).length) {
        return;
      }
    }
    await submitForm();
    setNextRequested(true);
  };

  React.useEffect(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
  }, [values.selectedHostIds]);

  React.useEffect(() => {
    if (nextRequested) {
      const agentStatuses = selectedAgents.map(
        (agent) => getWizardStepAgentStatus(agent, 'hosts-selection').status.key,
      );
      if (
        agentStatuses.some((status) =>
          ['disconnected', 'disabled', 'error', 'insufficient', 'cancelled'].includes(status),
        )
      ) {
        setNextRequested(false);
      } else if (
        selectedAgents.every(
          (agent) => getWizardStepAgentStatus(agent, 'hosts-selection').status.key === 'known',
        )
      ) {
        setShowClusterErrors(true);
        if (canNextFromHostSelectionStep(agentClusterInstall, selectedAgents)) {
          setCurrentStepId('networking');
        }
      }
    }
  }, [nextRequested, selectedAgents, agentClusterInstall, setCurrentStepId]);

  let submittingText: string | undefined = undefined;
  if (nextRequested && !showClusterErrors) {
    submittingText = 'Binding hosts...';
  } else if (isSubmitting) {
    submittingText = 'Saving changes...';
  }

  const onSyncError = React.useCallback(() => setNextRequested(false), []);

  const footer = (
    <ClusterDeploymentWizardFooter
      agentClusterInstall={agentClusterInstall}
      agents={selectedAgents}
      isSubmitting={!!submittingText}
      submittingText={submittingText}
      isNextDisabled={
        nextRequested || isSubmitting || (showFormErrors ? !isValid || isValidating : false)
      }
      onNext={onNext}
      onBack={() => setCurrentStepId('cluster-details')}
      onCancel={onClose}
      showClusterErrors={showClusterErrors}
      onSyncError={onSyncError}
    >
      {showFormErrors && errors.selectedHostIds && touched.selectedHostIds && (
        <Alert
          variant={AlertVariant.danger}
          title="Provided cluster configuration is not valid"
          isInline
        >
          {errors.selectedHostIds}
        </Alert>
      )}
    </ClusterDeploymentWizardFooter>
  );

  return (
    <ClusterDeploymentWizardStep footer={footer}>
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>Cluster hosts</ClusterWizardStepHeader>
        </GridItem>
        <GridItem>
          <ClusterDeploymentHostsSelection
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            clusterDeployment={clusterDeployment}
            aiConfigMap={aiConfigMap}
            hostActions={hostActions}
          />
        </GridItem>
      </Grid>
    </ClusterDeploymentWizardStep>
  );
};

const ClusterDeploymentHostSelectionStep: React.FC<ClusterDeploymentHostSelectionStepProps> = ({
  onSaveHostsSelection,
  ...rest
}) => {
  const { addAlert } = useAlerts();

  const { agents, clusterDeployment, agentClusterInstall } = rest;

  const [initialValues, validationSchema] = useHostsSelectionFormik({
    agents,
    clusterDeployment,
    agentClusterInstall,
  });

  const handleSubmit: FormikConfig<ClusterDeploymentHostsSelectionValues>['onSubmit'] = async (
    values,
    { setSubmitting },
  ) => {
    try {
      await onSaveHostsSelection(values);
    } catch (error) {
      addAlert({
        title: 'Failed to save host selection.',
        message: error.message as string,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <HostSelectionForm {...rest} />
    </Formik>
  );
};

export default ClusterDeploymentHostSelectionStep;
