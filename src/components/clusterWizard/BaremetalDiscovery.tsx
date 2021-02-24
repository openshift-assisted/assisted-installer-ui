import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Cluster, ClusterUpdateParams, ListOperators } from '../../api/types';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import ClusterWizardContext from './ClusterWizardContext';
import ClusterWizardStep from './ClusterWizardStep';
import ClusterWizardToolbar from './ClusterWizardToolbar';
import { canNextBaremetalDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError, stringToJSON } from '../../api/utils';
import { BareMetalDiscoveryValues } from '../../types/clusters';
import { AlertsContext } from '../AlertsContextProvider';
import { useFeature } from '../../features/featureGate';
import { patchCluster } from '../../api/clusters';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import FormikAutoSave from '../ui/formik/FormikAutoSave';

const getInitialValues = (cluster: Cluster) => {
  const operators = stringToJSON<ListOperators>(cluster.operators);
  return {
    useExtraDisksForLocalStorage:
      operators?.find((o) => o.operatorType === 'ocs')?.enabled || false,
  };
};

const BaremetalDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');

  const handleSubmit = async (
    values: BareMetalDiscoveryValues,
    formikActions: FormikHelpers<BareMetalDiscoveryValues>,
  ) => {
    clearAlerts();

    const params: ClusterUpdateParams = {};
    if (isOpenshiftClusterStorageEnabled) {
      params.operators = [
        {
          enabled: values.useExtraDisksForLocalStorage,
          operatorType: 'ocs',
        },
      ];
    }

    try {
      const { data } = await patchCluster(cluster.id, params);
      formikActions.resetForm({
        values: getInitialValues(data),
      });
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik initialValues={getInitialValues(cluster)} onSubmit={handleSubmit}>
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
