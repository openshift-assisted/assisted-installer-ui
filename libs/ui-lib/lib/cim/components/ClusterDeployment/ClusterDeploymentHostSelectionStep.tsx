import React from 'react';
import * as Yup from 'yup';
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
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

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

const getValidationSchema = (agentClusterInstall: AgentClusterInstallK8sResource, t: TFunction) => {
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);

  return Yup.lazy<ClusterDeploymentHostsSelectionValues>(
    (values: ClusterDeploymentHostsSelectionValues) => {
      return Yup.object<ClusterDeploymentHostsSelectionValues>().shape({
        hostCount: isSNOCluster ? Yup.number() : hostCountValidationSchema(t),
        useMastersAsWorkers: Yup.boolean().required(t('ai:Required field')),
        autoSelectedHostIds: values.autoSelectHosts
          ? Yup.array<string>().min(values.hostCount).max(values.hostCount)
          : Yup.array<string>(),
        selectedHostIds: values.autoSelectHosts
          ? Yup.array<string>()
          : isSNOCluster
          ? Yup.array<string>()
              .min(1, t('ai:Please select one host for the cluster.'))
              .max(1, t('ai:Please select one host for the cluster.')) // TODO(jtomasek): replace this with Yup.array().length() after updating Yup
          : Yup.array<string>().min(3, t('ai:Please select at least 3 hosts for the cluster.')),
      });
    },
  );
};

type UseHostsSelectionFormikArgs = {
  agents: AgentK8sResource[];
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  t: TFunction;
};

export const useHostsSelectionFormik = ({
  agents,
  clusterDeployment,
  agentClusterInstall,
  t,
}: UseHostsSelectionFormikArgs): [
  ClusterDeploymentHostsSelectionValues,
  Yup.Lazy<ClusterDeploymentHostsSelectionValues>,
] => {
  const initialValues = React.useMemo(
    () => getInitialValues({ agents, clusterDeployment, agentClusterInstall }),
    [agentClusterInstall, agents, clusterDeployment],
  );

  const validationSchema = React.useMemo(
    () => getValidationSchema(agentClusterInstall, t),
    [agentClusterInstall, t],
  );

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

type HostSelectionFormProps = Omit<ClusterDeploymentHostSelectionStepProps, 'onSaveHostsSelection'>;

const HostSelectionForm: React.FC<HostSelectionFormProps> = ({
  agents,
  agentClusterInstall,
  onClose,
  clusterDeployment,
  aiConfigMap,
  onEditRole: onEditRoleInit,
  onSetInstallationDiskId,
  isNutanix,
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
  const { t } = useTranslation();
  const onEditRole = React.useCallback(
    async (agent: AgentK8sResource, role: string | undefined) => {
      setNextRequested(false);
      setShowClusterErrors(false);
      setSubmitting(true);
      const response = await onEditRoleInit?.(agent, role);
      setSubmitting(false);
      return response;
    },
    [onEditRoleInit, setSubmitting],
  );

  const onAutoSelectChange = React.useCallback(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
    setShowFormErrors(false);
  }, []);

  const onHostSelect = React.useCallback(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
  }, []);

  const onNext = async () => {
    if (!showFormErrors) {
      setShowFormErrors(true);
      const errors = await validateForm();
      setTouched(
        Object.keys(errors).reduce((acc, curr) => {
          acc[curr] = true;
          return acc;
        }, {} as Record<string, boolean>),
      );
      if (Object.keys(errors).length) {
        return;
      }
    }
    void submitForm();
    setNextRequested(true);
  };

  React.useEffect(() => {
    if (nextRequested && !isSubmitting) {
      const agentStatuses = selectedAgents.map(
        (agent) => getWizardStepAgentStatus(agent, 'hosts-selection', t).status.key,
      );
      if (
        agentStatuses.some((status) =>
          ['disconnected', 'disabled', 'error', 'insufficient', 'cancelled'].includes(status),
        )
      ) {
        setNextRequested(false);
      } else if (
        !!selectedAgents.length &&
        selectedAgents.every(
          (agent) => getWizardStepAgentStatus(agent, 'hosts-selection', t).status.key === 'known',
        )
      ) {
        setShowClusterErrors(true);
        if (canNextFromHostSelectionStep(agentClusterInstall, selectedAgents)) {
          setCurrentStepId('networking');
        }
      }
    }
  }, [nextRequested, selectedAgents, agentClusterInstall, setCurrentStepId, isSubmitting, t]);

  let submittingText: string | undefined = undefined;

  if (isSubmitting) {
    submittingText = t('ai:Saving changes...');
  } else if (nextRequested && !showClusterErrors) {
    submittingText = t('ai:Binding hosts...');
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
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onNext={onNext}
      onBack={() => setCurrentStepId('cluster-details')}
      onCancel={onClose}
      showClusterErrors={showClusterErrors}
      onSyncError={onSyncError}
    >
      {showFormErrors && errors.selectedHostIds && touched.selectedHostIds && (
        <Alert
          variant={AlertVariant.danger}
          title={t('ai:Provided cluster configuration is not valid')}
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
          <ClusterWizardStepHeader>{t('ai:Cluster hosts')}</ClusterWizardStepHeader>
        </GridItem>
        <GridItem>
          <ClusterDeploymentHostsSelection
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            clusterDeployment={clusterDeployment}
            aiConfigMap={aiConfigMap}
            onEditRole={onEditRole}
            onSetInstallationDiskId={onSetInstallationDiskId}
            onAutoSelectChange={onAutoSelectChange}
            onHostSelect={onHostSelect}
            isNutanix={isNutanix}
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
  const { t } = useTranslation();

  const { addAlert } = useAlerts();
  const { agents, clusterDeployment, agentClusterInstall } = rest;

  const [initialValues, validationSchema] = useHostsSelectionFormik({
    agents,
    clusterDeployment,
    agentClusterInstall,
    t,
  });

  const handleSubmit: FormikConfig<ClusterDeploymentHostsSelectionValues>['onSubmit'] = async (
    values,
    { setSubmitting },
  ) => {
    try {
      await onSaveHostsSelection(values);
    } catch (e) {
      const error = e as Error;
      addAlert({
        title: t('ai:Failed to save host selection.'),
        message: error.message,
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
