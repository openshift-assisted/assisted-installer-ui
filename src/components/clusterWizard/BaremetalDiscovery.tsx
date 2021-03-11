import React from 'react';
import { useDispatch } from 'react-redux';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import { Formik, FormikProps } from 'formik';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import ClusterWizardContext from './ClusterWizardContext';
import ClusterWizardStep from './ClusterWizardStep';
import ClusterWizardToolbar from './ClusterWizardToolbar';
import { canNextBaremetalDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { BareMetalDiscoveryValues } from '../../types/clusters';
import { AlertsContext } from '../AlertsContextProvider';
import { patchCluster } from '../../api/clusters';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { getBareMetalDiscoveryInitialValues } from '../clusterConfiguration/utils';
import { getOlmOperatorsByName } from '../clusters/utils';
import FormikAutoSave from '../ui/formik/FormikAutoSave';

const BaremetalDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);

  const handleSubmit = async (values: BareMetalDiscoveryValues) => {
    clearAlerts();

    const params: ClusterUpdateParams = {};
    const enabledOlmOperatorsByName = getOlmOperatorsByName(cluster);

    if (values.useExtraDisksForLocalStorage) {
      enabledOlmOperatorsByName.ocs = { name: 'ocs' };
    } else {
      delete enabledOlmOperatorsByName.ocs;
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
    <Formik initialValues={getBareMetalDiscoveryInitialValues(cluster)} onSubmit={handleSubmit}>
      {({ isSubmitting, dirty, errors }: FormikProps<BareMetalDiscoveryValues>) => {
        const footer = (
          <ClusterWizardToolbar
            cluster={cluster}
            dirty={dirty}
            formErrors={errors}
            isSubmitting={isSubmitting}
            isNextDisabled={dirty || !canNextBaremetalDiscovery({ cluster })}
            onNext={() => setCurrentStepId('networking')}
            onBack={() => setCurrentStepId('cluster-details')}
          />
        );

        return (
          <ClusterWizardStep cluster={cluster} footer={footer}>
            <BaremetalInventory cluster={cluster} />
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default BaremetalDiscovery;
