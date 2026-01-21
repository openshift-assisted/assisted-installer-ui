import React from 'react';
import { Formik, useFormikContext } from 'formik';
import {
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  useWizardContext,
  useWizardFooter,
  WizardFooter,
} from '@patternfly/react-core';

import {
  useAlerts,
  ClusterWizardStepHeader,
  FormikAutoSave,
  getFormikErrorFields,
  clusterFieldLabels,
  Alerts,
} from '@openshift-assisted/common';

import {
  ClusterDeploymentDetailsNetworkingProps,
  AgentTableActions,
  ClusterDeploymentNetworkingValues,
} from '../types';
import ClusterDeploymentNetworkingForm from './ClusterDeploymentNetworkingForm';
import { isAgentOfCluster } from '../helpers';
import { useInfraEnvProxies, useNetworkingFormik } from '../use-networking-formik';
import { canNextFromNetworkingStep } from '../wizardTransition';
import { AgentK8sResource } from '../../../types';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import { ValidationSection } from '../components/ValidationSection';
import { ClusterDeploymentWizardContext } from '../ClusterDeploymentWizardContext';

type NetworkingFormProps = {
  clusterDeployment: ClusterDeploymentDetailsNetworkingProps['clusterDeployment'];
  agentClusterInstall: ClusterDeploymentDetailsNetworkingProps['agentClusterInstall'];
  agents: AgentK8sResource[];
  fetchInfraEnv: ClusterDeploymentDetailsNetworkingProps['fetchInfraEnv'];
  onEditHost: AgentTableActions['onEditHost'];
  onEditRole: AgentTableActions['onEditRole'];
  onSetInstallationDiskId: AgentTableActions['onSetInstallationDiskId'];
  isPreviewOpen: ClusterDeploymentDetailsNetworkingProps['isPreviewOpen'];
  isNutanix: ClusterDeploymentDetailsNetworkingProps['isNutanix'];
};

export const NetworkingForm = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  fetchInfraEnv,
  onEditHost,
  onEditRole,
  isPreviewOpen,
  onSetInstallationDiskId,
  isNutanix,
}: NetworkingFormProps) => {
  const { t } = useTranslation();
  const { activeStep, goToPrevStep, goToNextStep, close } = useWizardContext();
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);
  const { alerts } = useAlerts();
  const [showFormErrors, setShowFormErrors] = React.useState(false);
  const [showClusterErrors, setShowClusterErrors] = React.useState(false);
  const [nextRequested, setNextRequested] = React.useState(false);
  const { infraEnvWithProxy, infraEnvsError, infraEnvsLoading, sameProxies } = useInfraEnvProxies({
    fetchInfraEnv,
    agents,
  });
  const { isValid, isValidating, isSubmitting, validateForm, setTouched, errors, touched, values } =
    useFormikContext<ClusterDeploymentNetworkingValues>();

  const canContinue = React.useMemo(
    () => canNextFromNetworkingStep(agentClusterInstall, agents),
    [agentClusterInstall, agents],
  );

  const onNext = React.useCallback(async () => {
    if (!showFormErrors) {
      const errors = await validateForm();
      setTouched(
        Object.keys(errors).reduce((acc, curr) => {
          acc[curr] = true;
          return acc;
        }, {} as Record<string, boolean>),
      );
      setShowFormErrors(true);
      if (Object.keys(errors).length) {
        return;
      }
    }
    setNextRequested(true);
  }, [setTouched, showFormErrors, validateForm]);

  React.useEffect(() => {
    setNextRequested(false);
    setShowClusterErrors(false);
  }, [values.apiVips, values.ingressVips]);

  React.useEffect(() => {
    if (nextRequested) {
      setShowClusterErrors(true);
      if (canContinue) {
        void goToNextStep();
      }
    }
  }, [nextRequested, canContinue, goToNextStep]);

  React.useEffect(() => {
    if (syncError) {
      setNextRequested(false);
    }
  }, [syncError]);

  const errorFields = getFormikErrorFields(errors, touched);

  const submittingText = React.useMemo(() => {
    if (isSubmitting) {
      return t('ai:Saving changes...');
    } else if (isValidating || nextRequested) {
      return t('ai:Validating...');
    }
    return undefined;
  }, [isSubmitting, isValidating, nextRequested, t]);

  const footer = React.useMemo(
    () => (
      <WizardFooter
        activeStep={activeStep}
        onNext={onNext}
        isNextDisabled={
          nextRequested || isSubmitting || (showFormErrors ? !isValid || isValidating : false)
        }
        nextButtonProps={{ isLoading: !!submittingText }}
        nextButtonText={submittingText || t('ai:Next')}
        onBack={goToPrevStep}
        onClose={close}
      />
    ),
    [
      activeStep,
      onNext,
      nextRequested,
      isSubmitting,
      showFormErrors,
      isValid,
      isValidating,
      submittingText,
      goToPrevStep,
      close,
      t,
    ],
  );

  useWizardFooter(footer);

  return (
    <>
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>{t('ai:Networking')}</ClusterWizardStepHeader>
        </GridItem>
        <GridItem>
          <ClusterDeploymentNetworkingForm
            clusterDeployment={clusterDeployment}
            agentClusterInstall={agentClusterInstall}
            agents={agents}
            sameProxies={sameProxies}
            infraEnvsError={infraEnvsError}
            infraEnvWithProxy={infraEnvWithProxy}
            infraEnvsLoading={infraEnvsLoading}
            onEditHost={onEditHost}
            onEditRole={onEditRole}
            isPreviewOpen={isPreviewOpen}
            onSetInstallationDiskId={onSetInstallationDiskId}
            isNutanix={isNutanix}
          />
        </GridItem>

        {showFormErrors && !!errorFields.length && (
          <GridItem>
            <Alert
              variant={AlertVariant.danger}
              title={t('ai:Provided cluster configuration is not valid')}
              isInline
            >
              {t('ai:The following fields are invalid or missing')}:{' '}
              {errorFields.map((field: string) => clusterFieldLabels(t)[field] || field).join(', ')}
              .
            </Alert>
          </GridItem>
        )}

        {(showClusterErrors || showFormErrors) && !!alerts.length && (
          <GridItem>
            <Alerts />
          </GridItem>
        )}

        {syncError && (
          <GridItem>
            <ValidationSection currentStepId={'networking'} hosts={[]}>
              <Alert variant={AlertVariant.danger} title={t('ai:An error occurred')} isInline>
                {syncError}
              </Alert>
            </ValidationSection>
          </GridItem>
        )}
      </Grid>
      <FormikAutoSave />
    </>
  );
};

export const ClusterDeploymentNetworkingStep = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onSaveNetworking,
  ...rest
}: ClusterDeploymentDetailsNetworkingProps) => {
  const { addAlert } = useAlerts();

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;

  const clusterAgents = React.useMemo(
    () => agents.filter((a) => isAgentOfCluster(a, cdName, cdNamespace)),
    [agents, cdName, cdNamespace],
  );

  const { initialValues, validationSchema } = useNetworkingFormik({
    clusterDeployment,
    agentClusterInstall,
    agents: clusterAgents,
  });
  const { t } = useTranslation();
  const handleSubmit = async (values: ClusterDeploymentNetworkingValues) => {
    try {
      await onSaveNetworking(values);
    } catch (error) {
      addAlert({
        title: t('ai:Failed to save ClusterDeployment'),
        message: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <NetworkingForm
        {...rest}
        agents={clusterAgents}
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
      />
    </Formik>
  );
};
