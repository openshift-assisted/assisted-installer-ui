import React from 'react';
import { useSelector } from 'react-redux';
import { Cluster, ClusterWizardStep, getFormikErrorFields, useAlerts } from '../../../common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import {
  StaticIpFormState,
  StaticIpProps,
} from '../clusterConfiguration/staticIp/components/propTypes';
import { StaticIpPage } from '../clusterConfiguration/staticIp/components/StaticIpPage';
import { WithErrorBoundary } from '../../../common/components/ErrorHandling/WithErrorBoundary';
import { selectCurrentClusterPermissionsState } from '../../selectors';

const getInitialFormStateProps = () => {
  return {
    isValid: true,
    isSubmitting: false,
    isAutoSaveRunning: false,
    errors: {},
    touched: {},
    isEmpty: true,
  };
};
const StaticIp: React.FC<StaticIpProps & { cluster: Cluster }> = ({
  cluster,
  infraEnv,
  updateInfraEnv,
}) => {
  const clusterWizardContext = useClusterWizardContext();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { alerts } = useAlerts();
  const [formState, setFormStateProps] = React.useState<StaticIpFormState>(
    getInitialFormStateProps(),
  );

  const onFormStateChange = (formState: StaticIpFormState) => {
    if (!isViewerMode) {
      setFormStateProps(formState);
    }
  };

  const isNextDisabled =
    formState.isAutoSaveRunning || !formState.isValid || !!alerts.length || formState.isSubmitting;
  const errorFields = getFormikErrorFields<object>(formState.errors, formState.touched);
  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      alertTitle="Static IP configuration contains missing or invalid fields"
      alertContent={null}
      errorFields={errorFields}
      isSubmitting={formState.isSubmitting}
      onNext={() => clusterWizardContext.moveNext()}
      onBack={() => clusterWizardContext.moveBack()}
      isNextDisabled={isNextDisabled}
      isBackDisabled={formState.isSubmitting || formState.isAutoSaveRunning}
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <WithErrorBoundary title="Failed to load Static IP step">
        <StaticIpPage {...{ infraEnv, updateInfraEnv, onFormStateChange }} />
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default StaticIp;
