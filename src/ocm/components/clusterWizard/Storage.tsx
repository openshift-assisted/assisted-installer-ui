import React from 'react';
import { StorageStep } from '../clusterConfiguration/StorageStep';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterWizardStep,
  useAlerts,
  getStorageInitialValues,
  HostDiscoveryValues,
  useFormikAutoSave,
} from '../../../common';
import { StorageValues } from '../../../common/types/clusters';
import ClusterWizardFooter from './ClusterWizardFooter';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { canNextStorage } from './wizardTransition';

const StorageForm: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const { isSubmitting, touched, errors } = useFormikContext<HostDiscoveryValues>();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);
  const isNextDisabled =
    !canNextStorage({ cluster }) || isAutoSaveRunning || !!alerts.length || isSubmitting;

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      errorFields={errorFields}
      isSubmitting={isSubmitting}
      isNextDisabled={isNextDisabled}
      onNext={() => clusterWizardContext.moveNext()}
      onBack={() => clusterWizardContext.moveBack()}
    />
  );
  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <StorageStep cluster={cluster} />
      <FormikAutoSave />
    </ClusterWizardStep>
  );
};

const Storage: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getStorageInitialValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );
  const handleSubmit: FormikConfig<StorageValues>['onSubmit'] = () => {
    clearAlerts();
  };

  return (
    <Formik onSubmit={handleSubmit} initialValues={initialValues}>
      <StorageForm cluster={cluster} />
    </Formik>
  );
};

export default Storage;
