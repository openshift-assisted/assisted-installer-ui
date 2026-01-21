import React from 'react';
import { ClusterWizardStep, getFormikErrorFields, useAlerts } from '../../../../common';
import { useClusterWizardContext } from '../ClusterWizardContext';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { StaticIpFormState } from '../../clusterConfiguration/staticIp/components/propTypes';
import { StaticIpPage } from '../../clusterConfiguration/staticIp/components/StaticIpPage';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import { InfraEnvsAPI } from '../../../services/apis';
import { InfraEnvUpdateParams } from '@openshift-assisted/types/assisted-installer-service';

const getInitialFormStateProps = (): StaticIpFormState => {
  return {
    isValid: true,
    isSubmitting: false,
    isAutoSaveRunning: false,
    errors: {},
    touched: {},
    isEmpty: true,
  };
};

const DisconnectedStaticIp: React.FC = () => {
  const { moveNext, moveBack, disconnectedInfraEnv, setDisconnectedInfraEnv } =
    useClusterWizardContext();
  const { alerts } = useAlerts();
  const [formState, setFormStateProps] = React.useState<StaticIpFormState>(
    getInitialFormStateProps(),
  );

  const onFormStateChange = (formState: StaticIpFormState) => {
    setFormStateProps(formState);
  };

  const updateInfraEnv = async (params: InfraEnvUpdateParams) => {
    if (!disconnectedInfraEnv?.id) {
      throw new Error('No disconnected infraEnv available');
    }
    const { data: updatedInfraEnv } = await InfraEnvsAPI.update(disconnectedInfraEnv.id, params);
    setDisconnectedInfraEnv(updatedInfraEnv);
    return updatedInfraEnv;
  };

  const isNextDisabled =
    formState.isAutoSaveRunning || !formState.isValid || !!alerts.length || formState.isSubmitting;
  const errorFields = getFormikErrorFields<object>(formState.errors, formState.touched);

  const footer = (
    <ClusterWizardFooter
      alertTitle="Static IP configuration contains missing or invalid fields"
      alertContent={null}
      errorFields={errorFields}
      isSubmitting={formState.isSubmitting}
      onNext={() => moveNext()}
      onBack={() => moveBack()}
      isNextDisabled={isNextDisabled}
      isBackDisabled={formState.isSubmitting || formState.isAutoSaveRunning}
    />
  );

  if (!disconnectedInfraEnv) {
    return null;
  }

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation />} footer={footer}>
      <WithErrorBoundary title="Failed to load Static IP step">
        <StaticIpPage
          infraEnv={disconnectedInfraEnv}
          updateInfraEnv={updateInfraEnv}
          onFormStateChange={onFormStateChange}
        />
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default DisconnectedStaticIp;
