import React from 'react';
import { ClusterWizardStep, getFormikErrorFields, useAlerts } from '../../../common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../common/components/ErrorHandling/WithErrorBoundary';
import { CustomManifestsPage } from '../clusterConfiguration/manifestsConfiguration/CustomManifestsPage';
import { CustomManifestFormState } from '../clusterConfiguration/manifestsConfiguration/components/propTypes';
import { useSelector } from 'react-redux';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

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
const CustomManifestStep = ({ cluster }: { cluster: Cluster }) => {
  const clusterWizardContext = useClusterWizardContext();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { alerts } = useAlerts();
  const [formState, setFormStateProps] = React.useState<CustomManifestFormState>(
    getInitialFormStateProps(),
  );

  const onFormStateChange = (formState: CustomManifestFormState) => {
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
      alertTitle="Custom manifests configuration contains missing or invalid fields"
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
      <WithErrorBoundary title="Failed to load Custom manifests step">
        <CustomManifestsPage {...{ cluster, onFormStateChange }} />
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default CustomManifestStep;
