import React from 'react';
import { StackItem } from '@patternfly/react-core';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterWizardStep,
  useAlerts,
  getStorageInitialValues,
  StorageValues,
  useFormikAutoSave,
  ClusterWizardStepHeader,
} from '../../../common';
import ClusterWizardFooter from './ClusterWizardFooter';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { canNextStorage } from './wizardTransition';
import HostsStorageTable from '../hosts/HostsStorageTable';

const StorageForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const { isSubmitting, touched, errors } = useFormikContext<StorageValues>();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields<StorageValues>(errors, touched);
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
      isBackDisabled={isSubmitting || isAutoSaveRunning}
    />
  );
  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <StackItem>
        <ClusterWizardStepHeader>Storage</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <HostsStorageTable cluster={cluster} />
      </StackItem>
      <FormikAutoSave />
    </ClusterWizardStep>
  );
};

const Storage = ({ cluster }: { cluster: Cluster }) => {
  const { clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getStorageInitialValues(),
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
