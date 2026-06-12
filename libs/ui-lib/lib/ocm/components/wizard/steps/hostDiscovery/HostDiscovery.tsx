import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  getFormikErrorFields,
  ClusterWizardStep,
  HostDiscoveryValues,
  useAlerts,
  getHostDiscoveryInitialValues,
  useFormikAutoSave,
  getApiErrorMessage,
  handleApiError,
  isUnknownServerError,
} from '../../../../../common';
import { ClustersService, HostDiscoveryService } from '../../../../services';
import {
  setServerUpdateError,
  updateCluster,
  selectCurrentClusterPermissionsState,
} from '../../../../store';
import { useLateBinding } from '../../../../hooks';
import { canNextHostDiscovery } from '../../utils';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardFooter, ClusterWizardNavigation } from '../../wizardComponents';
import { HostInventory } from './HostInventory';

const HostDiscoveryForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<HostDiscoveryValues>();
  const clusterWizardContext = useClusterWizardContext();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);
  const isBinding = useLateBinding(cluster);

  const isNextDisabled =
    !isValid ||
    !!alerts.length ||
    isAutoSaveRunning ||
    isSubmitting ||
    isBinding ||
    !canNextHostDiscovery({ cluster });

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
      <HostInventory cluster={cluster} />
    </ClusterWizardStep>
  );
};

export const HostDiscovery = ({ cluster }: { cluster: Cluster }) => {
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const initialValues = React.useMemo(
    () => getHostDiscoveryInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const onSubmit: FormikConfig<HostDiscoveryValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const params: V2ClusterUpdateParams = {};

    HostDiscoveryService.setSchedulableMasters(params, values, cluster);

    try {
      const { data } = await ClustersService.update(cluster.id, cluster.tags, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getApiErrorMessage(e) }),
      );
      if (isUnknownServerError(e as Error)) {
        dispatch(setServerUpdateError());
      }
    }
  };

  const handleSubmit = isViewerMode ? () => Promise.resolve() : onSubmit;
  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <HostDiscoveryForm cluster={cluster} />
    </Formik>
  );
};
