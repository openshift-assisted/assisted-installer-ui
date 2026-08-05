import React from 'react';
import isEqual from 'lodash-es/isEqual.js';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  useWizardContext,
  useWizardFooter,
  WizardFooter,
} from '@patternfly/react-core';
import { Alerts, ClusterWizardStepHeader, useAlerts, useTranslation } from '../../../../common';
import { AgentK8sResource } from '../../../types';
import { getWizardStepAgentStatus } from '../../helpers';
import {
  ClusterDeploymentHostSelectionStepProps,
  ClusterDeploymentHostsSelectionValues,
} from '../types';
import { ClusterDeploymentWizardContext } from '../ClusterDeploymentWizardContext';
import { ValidationSection } from '../components/ValidationSection';
import { canNextFromHostSelectionStep } from '../wizardTransition';
import { getAgentRoleCounts } from './utils';
import { ClusterDeploymentHostsSelection } from './ClusterDeploymentHostsSelection';
import { useHostsSelectionFormik } from './useHostSelectionFormik';

type HostSelectionFormProps = Omit<ClusterDeploymentHostSelectionStepProps, 'onSaveHostsSelection'>;

const HostSelectionForm = ({
  agents,
  agentClusterInstall,
  clusterDeployment,
  aiConfigMap,
  onEditRole: onEditRoleInit,
  onSetInstallationDiskId,
  isNutanix,
}: HostSelectionFormProps) => {
  const { t } = useTranslation();
  const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);
  const { alerts } = useAlerts();
  const [nextRequested, setNextRequested] = React.useState(false);
  const [showClusterErrors, setShowClusterErrors] = React.useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);

  const {
    values,
    isValid,
    isValidating,
    isSubmitting,
    touched,
    errors,
    validateForm,
    setTouched,
    setFieldValue,
    submitForm,
    setSubmitting,
  } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  React.useEffect(() => {
    const selectedHostIds = values.autoSelectHosts
      ? values.autoSelectedHostIds
      : values.selectedHostIds;

    const agentsSelected = agents.filter((agent) =>
      selectedHostIds.includes(agent.metadata?.uid || ''),
    );

    const newRoleCounts = getAgentRoleCounts(agentsSelected);

    if (!isEqual(values.selectedRoleCounts, newRoleCounts)) {
      setFieldValue('selectedRoleCounts', newRoleCounts, true);
    }

    // exclude values.selectedRoleCounts from the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    agents,
    setFieldValue,
    values.autoSelectHosts,
    values.autoSelectedHostIds,
    values.selectedHostIds,
  ]);

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
    setHasAttemptedSubmit(false);
  }, []);

  const onHostSelect = React.useCallback(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
  }, []);

  const onNext = React.useCallback(async () => {
    if (!hasAttemptedSubmit) {
      setHasAttemptedSubmit(true);
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
  }, [setTouched, hasAttemptedSubmit, submitForm, validateForm]);

  React.useEffect(() => {
    if (nextRequested && !isSubmitting) {
      const selectedHostIds = values.autoSelectHosts
        ? values.autoSelectedHostIds
        : values.selectedHostIds;

      const selectedAgents = agents.filter((agent) =>
        selectedHostIds.includes(agent.metadata?.uid || ''),
      );

      const agentStatuses = selectedAgents.map(
        (agent) => getWizardStepAgentStatus(agent, 'host-selection', t).status.key,
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
          (agent) => getWizardStepAgentStatus(agent, 'host-selection', t).status.key === 'known',
        )
      ) {
        setShowClusterErrors(true);
        if (canNextFromHostSelectionStep(agentClusterInstall, selectedAgents)) {
          void goToNextStep();
        }
      }
    }
  }, [
    nextRequested,
    agentClusterInstall,
    isSubmitting,
    t,
    goToNextStep,
    agents,
    values.autoSelectHosts,
    values.autoSelectedHostIds,
    values.selectedHostIds,
  ]);

  const submittingText = React.useMemo(() => {
    if (isSubmitting) {
      return t('ai:Saving changes...');
    } else if (nextRequested && !showClusterErrors) {
      return t('ai:Binding hosts...');
    }
    return undefined;
  }, [isSubmitting, nextRequested, showClusterErrors, t]);

  React.useEffect(() => {
    if (syncError) {
      setNextRequested(false);
    }
  }, [syncError]);

  const errorsSection = (
    <ValidationSection currentStepId={'cluster-details'} hosts={[]}>
      {syncError && (
        <Alert variant={AlertVariant.danger} title={t('ai:An error occurred')} isInline>
          {syncError}
        </Alert>
      )}
    </ValidationSection>
  );

  const footer = React.useMemo(() => {
    const hasValidationErrors = hasAttemptedSubmit && (!isValid || isValidating);
    const isNextDisabled = nextRequested || isSubmitting || hasValidationErrors; // || !!syncError

    return (
      <WizardFooter
        activeStep={activeStep}
        onNext={onNext}
        isNextDisabled={isNextDisabled}
        nextButtonText={submittingText || t('ai:Next')}
        nextButtonProps={{ isLoading: !!submittingText }}
        onBack={goToPrevStep}
        onClose={close}
      />
    );
  }, [
    activeStep,
    onNext,
    nextRequested,
    isSubmitting,
    hasAttemptedSubmit,
    isValid,
    isValidating,
    submittingText,
    t,
    goToPrevStep,
    close,
  ]);

  useWizardFooter(footer);

  return (
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
          hostsBinding={nextRequested && !showClusterErrors}
        />
      </GridItem>
      {(showClusterErrors || hasAttemptedSubmit) && !!alerts.length && (
        <GridItem>
          <Alerts />
        </GridItem>
      )}

      {syncError && <GridItem>{errorsSection}</GridItem>}
      {hasAttemptedSubmit && errors.selectedRoleCounts && touched.selectedRoleCounts && (
        <GridItem>
          <Alert
            variant={AlertVariant.danger}
            title={t('ai:Provided cluster configuration is not valid')}
            isInline
          >
            {errors.selectedRoleCounts as string}
          </Alert>
        </GridItem>
      )}
    </Grid>
  );
};

export const ClusterDeploymentHostSelectionStep: React.FC<
  ClusterDeploymentHostSelectionStepProps
> = ({ onSaveHostsSelection, ...rest }) => {
  const { t } = useTranslation();

  const { addAlert } = useAlerts();
  const { agents, clusterDeployment, agentClusterInstall } = rest;

  const { initialValues, validationSchema } = useHostsSelectionFormik({
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
