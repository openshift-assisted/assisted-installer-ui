import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  V2ClusterUpdateParams,
  getFormikErrorFields,
  ClusterWizardStep,
  useAlerts,
  getHostDiscoveryInitialValues,
  useFormikAutoSave,
} from '../../../common';
import { HostDiscoveryValues } from '../../../common/types/clusters';
import HostInventory from '../clusterConfiguration/HostInventory';
import ClusterWizardContext from './ClusterWizardContext';
import { canNextHostDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { updateCluster } from '../../reducers/clusters/currentClusterSlice';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { ClustersAPI } from '../../services/apis';
import { HostDiscoveryService } from '../../services';

const HostDiscoveryForm: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { alerts } = useAlerts();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<HostDiscoveryValues>();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const isAutoSaveRunning = useFormikAutoSave();
  const errorFields = getFormikErrorFields(errors, touched);
  const isNextDisabled =
    !canNextHostDiscovery({ cluster }) ||
    isAutoSaveRunning ||
    !isValid ||
    !!alerts.length ||
    isSubmitting;

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      errorFields={errorFields}
      isSubmitting={isSubmitting}
      isNextDisabled={isNextDisabled}
      onNext={() => setCurrentStepId('networking')}
      onBack={() => setCurrentStepId('cluster-details')}
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <HostInventory cluster={cluster} />
    </ClusterWizardStep>
  );
};

const HostDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getHostDiscoveryInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const handleSubmit: FormikConfig<HostDiscoveryValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const params: V2ClusterUpdateParams = {};
    HostDiscoveryService.setPlatform(params, values.usePlatformIntegration);
    HostDiscoveryService.setOLMOperators(params, values, cluster.monitoredOperators);
    HostDiscoveryService.setSchedulableMasters(params, values, cluster);

    try {
      const { data } = await ClustersAPI.update(cluster.id, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <HostDiscoveryForm cluster={cluster} />
    </Formik>
  );
};

export default HostDiscovery;
