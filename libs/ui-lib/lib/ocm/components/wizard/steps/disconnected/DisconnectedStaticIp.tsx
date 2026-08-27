import React from 'react';
import {
  ClusterWizardStep,
  WithErrorBoundary,
  getFormikErrorFields,
  useAlerts,
  InfraEnvsAPI,
} from '../../../../../common';
import { InfraEnvUpdateParams } from '@openshift-assisted/types/assisted-installer-service';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { StaticIpFormState, StaticIpPage } from '../staticIp/components';

const getInitialFormState = (): StaticIpFormState => ({
  isValid: true,
  isSubmitting: false,
  isAutoSaveRunning: false,
  errors: {},
  touched: {},
  isEmpty: true,
});

export const DisconnectedStaticIp: React.FC = () => {
  const { moveNext, moveBack, disconnectedInfraEnv, setDisconnectedInfraEnv } =
    useClusterWizardContext();
  const { alerts } = useAlerts();
  const [formState, setFormState] = React.useState<StaticIpFormState>(getInitialFormState());

  const updateInfraEnv = React.useCallback(
    async (params: InfraEnvUpdateParams) => {
      if (!disconnectedInfraEnv?.id) {
        throw new Error('No disconnected infraEnv available');
      }
      const { data: updatedInfraEnv } = await InfraEnvsAPI.update(disconnectedInfraEnv.id, params);
      setDisconnectedInfraEnv(updatedInfraEnv);
      return updatedInfraEnv;
    },
    [disconnectedInfraEnv, setDisconnectedInfraEnv],
  );

  const isNextDisabled = !formState.isValid || !!alerts.length || formState.isSubmitting;
  const errorFields = getFormikErrorFields<object>(formState.errors, formState.touched);

  const footer = (
    <ClusterWizardFooter
      alertTitle="Static IP configuration contains missing or invalid fields"
      alertContent={null}
      errorFields={errorFields}
      isSubmitting={formState.isSubmitting}
      onNext={moveNext}
      onBack={moveBack}
      isNextDisabled={isNextDisabled}
      isBackDisabled={formState.isSubmitting}
    />
  );

  if (!disconnectedInfraEnv) {
    return null;
  }

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation />} footer={footer}>
      <WithErrorBoundary title="Failed to load static IP step">
        <StaticIpPage
          infraEnv={disconnectedInfraEnv}
          updateInfraEnv={updateInfraEnv}
          onFormStateChange={setFormState}
        />
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default DisconnectedStaticIp;
