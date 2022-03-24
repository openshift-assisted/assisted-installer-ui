import React from 'react';
import * as Yup from 'yup';
import { TestOptionsMessage } from 'yup';
import { Formik, useFormikContext, FormikConfig } from 'formik';
import { Grid, GridItem, Alert, AlertVariant } from '@patternfly/react-core';
import { ClusterWizardStepHeader, useAlerts } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import ClusterDeploymentWizardFooter from './ClusterDeploymentWizardFooter';
import ClusterDeploymentWizardStep from './ClusterDeploymentWizardStep';
import {
  ClusterDeploymentHostsDiscoveryStepProps,
  ClusterDeploymentHostsDiscoveryValues,
} from './types';
import ClusterDeploymentHostsDiscovery from './ClusterDeploymentHostsDiscovery';
import { getAgentsHostsNames, isAgentOfInfraEnv } from './helpers';
import { getIsSNOCluster, getWizardStepAgentStatus } from '../helpers';
import { canNextFromHostSelectionStep } from './wizardTransition';

const getInitialValues = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
}): ClusterDeploymentHostsDiscoveryValues => {
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

  const selectedIds = agents
    .filter(
      (agent) =>
        agent.spec?.clusterDeploymentName?.name === cdName &&
        agent.spec?.clusterDeploymentName?.namespace === cdNamespace,
    )
    .map((agent) => agent.metadata?.uid as string);

  return {
    useMastersAsWorkers: hostCount === 1 || hostCount === 3, // TODO: Recently not supported - https://issues.redhat.com/browse/MGMT-7677
    selectedHostIds: selectedIds,
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

  return Yup.lazy<ClusterDeploymentHostsDiscoveryValues>((values) => {
    return Yup.object<ClusterDeploymentHostsDiscoveryValues>().shape({
      useMastersAsWorkers: Yup.boolean().required(),
      selectedHostIds: isSNOCluster
        ? Yup.array<string>()
            .min(0, 'Please select one host for the cluster.')
            .max(1, 'Please select one host for the cluster.') // TODO(jtomasek): replace this with Yup.array().length() after updating Yup
        : Yup.array<string>().min(getMinHostsCount(values.selectedHostIds.length), getMinMessage),
    });
  });
};
type UseHostsDiscoveryFormikArgs = {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
};
export const useHostsDiscoveryFormik = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
}: UseHostsDiscoveryFormikArgs): [ClusterDeploymentHostsDiscoveryValues, Yup.Lazy] => {
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
  values: ClusterDeploymentHostsDiscoveryValues,
) => {
  return agents.filter((agent) => values.selectedHostIds.includes(agent.metadata?.uid || ''));
};

type HostDiscoveryFormProps = Pick<
  ClusterDeploymentHostsDiscoveryStepProps,
  | 'agents'
  | 'agentClusterInstall'
  | 'infraEnv'
  | 'clusterDeployment'
  | 'bareMetalHosts'
  | 'onCreateBMH'
  | 'onSaveAgent'
  | 'onEditRole'
  | 'onSaveBMH'
  | 'onSaveISOParams'
  | 'onFormSaveError'
  | 'fetchSecret'
  | 'fetchNMState'
  | 'onChangeBMHHostname'
  | 'onApproveAgent'
  | 'onDeleteHost'
  | 'getClusterDeploymentLink'
  | 'isBMPlatform'
>;

const HostDiscoveryForm: React.FC<HostDiscoveryFormProps> = ({
  agentClusterInstall,
  agents: allAgents,
  infraEnv,
  clusterDeployment,
  bareMetalHosts,
  onCreateBMH,
  onSaveAgent,
  onEditRole,
  onSaveBMH,
  onSaveISOParams,
  onFormSaveError,
  fetchSecret,
  fetchNMState,
  onChangeBMHHostname,
  onApproveAgent,
  onDeleteHost,
  getClusterDeploymentLink,
  isBMPlatform,
  ...rest
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
  } = useFormikContext<ClusterDeploymentHostsDiscoveryValues>();
  const [nextRequested, setNextRequested] = React.useState(false);
  const [showFormErrors, setShowFormErrors] = React.useState(false);
  const infraEnvAgents = React.useMemo(
    () => allAgents.filter((a: AgentK8sResource | undefined) => isAgentOfInfraEnv(infraEnv, a)),
    [allAgents, infraEnv],
  );
  const selectedAgents = getSelectedAgents(allAgents, values);
  const usedHostnames = React.useMemo(() => getAgentsHostsNames(allAgents), [allAgents]);
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
      agents={infraEnvAgents}
      isSubmitting={!!submittingText}
      submittingText={submittingText}
      isNextDisabled={
        nextRequested || isSubmitting || (showFormErrors ? !isValid || isValidating : false)
      }
      onNext={onNext}
      onBack={() => setCurrentStepId('cluster-details')}
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
          <ClusterDeploymentHostsDiscovery
            agentClusterInstall={agentClusterInstall}
            agents={infraEnvAgents}
            infraEnv={infraEnv}
            bareMetalHosts={bareMetalHosts}
            usedHostnames={usedHostnames}
            clusterDeployment={clusterDeployment}
            onCreateBMH={onCreateBMH}
            onSaveAgent={onSaveAgent}
            onEditRole={onEditRole}
            onSaveBMH={onSaveBMH}
            onSaveISOParams={onSaveISOParams}
            onFormSaveError={onFormSaveError}
            fetchSecret={fetchSecret}
            fetchNMState={fetchNMState}
            onChangeBMHHostname={onChangeBMHHostname}
            onApproveAgent={onApproveAgent}
            onDeleteHost={onDeleteHost}
            getClusterDeploymentLink={getClusterDeploymentLink}
            isBMPlatform={isBMPlatform}
            {...rest}
          />
        </GridItem>
      </Grid>
    </ClusterDeploymentWizardStep>
  );
};

const ClusterDeploymentHostsDiscoveryStep: React.FC<ClusterDeploymentHostsDiscoveryStepProps> = ({
  onSaveHostsDiscovery,
  bareMetalHosts,
  infraEnv,
  onCreateBMH,
  onSaveAgent,
  onEditRole,
  onSaveBMH,
  onSaveISOParams,
  onFormSaveError,
  fetchSecret,
  fetchNMState,
  onChangeBMHHostname,
  onApproveAgent,
  onDeleteHost,
  isBMPlatform,
  ...rest
}) => {
  const { addAlert } = useAlerts();
  const { agents, clusterDeployment, agentClusterInstall } = rest;
  const [initialValues, validationSchema] = useHostsDiscoveryFormik({
    agents: agents,
    clusterDeployment,
    agentClusterInstall,
  });

  const handleSubmit: FormikConfig<ClusterDeploymentHostsDiscoveryValues>['onSubmit'] = async (
    values,
    { setSubmitting },
  ) => {
    try {
      await onSaveHostsDiscovery(values);
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
      <HostDiscoveryForm
        bareMetalHosts={bareMetalHosts}
        infraEnv={infraEnv}
        onCreateBMH={onCreateBMH}
        onSaveAgent={onSaveAgent}
        onEditRole={onEditRole}
        onSaveBMH={onSaveBMH}
        onSaveISOParams={onSaveISOParams}
        onFormSaveError={onFormSaveError}
        fetchSecret={fetchSecret}
        fetchNMState={fetchNMState}
        onChangeBMHHostname={onChangeBMHHostname}
        onApproveAgent={onApproveAgent}
        onDeleteHost={onDeleteHost}
        isBMPlatform={isBMPlatform}
        {...rest}
      />
    </Formik>
  );
};

export default ClusterDeploymentHostsDiscoveryStep;
