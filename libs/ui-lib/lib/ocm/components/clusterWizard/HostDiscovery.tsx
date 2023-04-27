import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  V2ClusterUpdateParams,
  getFormikErrorFields,
  ClusterWizardStep,
  HostDiscoveryValues,
  useAlerts,
  getHostDiscoveryInitialValues,
  useFormikAutoSave,
  SupportedPlatformType,
} from '../../../common';
import HostInventory from '../clusterConfiguration/HostInventory';
import { useClusterWizardContext } from './ClusterWizardContext';
import { canNextHostDiscovery } from './wizardTransition';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../api';
import { setServerUpdateError, updateCluster } from '../../reducers/clusters';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { ClustersService, HostDiscoveryService } from '../../services';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import useClusterSupportedPlatforms from '../../hooks/useClusterSupportedPlatforms';

const HostDiscoveryForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<HostDiscoveryValues>();
  const clusterWizardContext = useClusterWizardContext();
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);

  const isNextDisabled =
    !isValid ||
    !!alerts.length ||
    isAutoSaveRunning ||
    isSubmitting ||
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

const HostDiscovery = ({ cluster }: { cluster: Cluster }) => {
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const initialValues = React.useMemo(
    () => getHostDiscoveryInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );
  const { supportedPlatformIntegration } = useClusterSupportedPlatforms(cluster.id);

  const onSubmit: FormikConfig<HostDiscoveryValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const platformToIntegrate = values.usePlatformIntegration
      ? supportedPlatformIntegration === 'no-active-integrations'
        ? undefined
        : supportedPlatformIntegration
      : undefined;

    const params: V2ClusterUpdateParams = {};

    HostDiscoveryService.setPlatform(
      params,
      platformToIntegrate as SupportedPlatformType,
      cluster.userManagedNetworking,
    );
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

export default HostDiscovery;
