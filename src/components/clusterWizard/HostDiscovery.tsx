import React from 'react';
import { useDispatch } from 'react-redux';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import { Formik, FormikProps } from 'formik';
import HostInventory from '../clusterConfiguration/HostInventory';
import ClusterWizardContext from './ClusterWizardContext';
import ClusterWizardStep from './ClusterWizardStep';
import ClusterWizardToolbar from './ClusterWizardToolbar';
import { canNextHostDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { HostDiscoveryValues } from '../../types/clusters';
import { AlertsContext } from '../AlertsContextProvider';
import { patchCluster } from '../../api/clusters';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { getHostDiscoveryInitialValues } from '../clusterConfiguration/utils';
import { getOlmOperatorCreateParamsByName } from '../clusters/utils';
import FormikAutoSave from '../ui/formik/FormikAutoSave';

const HostDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);

  const handleSubmit = async (values: HostDiscoveryValues) => {
    clearAlerts();

    const params: ClusterUpdateParams = {};
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster.monitoredOperators);

    if (values.useExtraDisksForLocalStorage) {
      enabledOlmOperatorsByName.ocs = { name: 'ocs' };
    } else {
      delete enabledOlmOperatorsByName.ocs;
      // TODO(jtomasek): remove this once enabling OCS is moved into a separate storage step and LSO option is exposed to the user
      delete enabledOlmOperatorsByName.lso;
    }
    params.olmOperators = Object.values(enabledOlmOperatorsByName);

    try {
      const { data } = await patchCluster(cluster.id, params);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik initialValues={getHostDiscoveryInitialValues(cluster)} onSubmit={handleSubmit}>
      {({ isSubmitting, dirty, errors }: FormikProps<HostDiscoveryValues>) => {
        const footer = (
          <ClusterWizardToolbar
            cluster={cluster}
            dirty={dirty}
            formErrors={errors}
            isSubmitting={isSubmitting}
            isNextDisabled={dirty || !canNextHostDiscovery({ cluster })}
            onNext={() => setCurrentStepId('networking')}
            onBack={() => setCurrentStepId('cluster-details')}
          />
        );

        return (
          <ClusterWizardStep cluster={cluster} footer={footer}>
            <HostInventory cluster={cluster} />
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default HostDiscovery;
