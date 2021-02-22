import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import ClusterWizardContext from './ClusterWizardContext';
import ClusterWizardStep from './ClusterWizardStep';
import ClusterWizardToolbar from './ClusterWizardToolbar';
import { canNextBaremetalDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { BareMetalDiscoveryValues } from '../../types/clusters';
import { Stack, StackItem } from '@patternfly/react-core';
import { AlertsContext } from '../AlertsContextProvider';
import Alerts from '../ui/Alerts';
import { patchCluster } from '../../api/clusters';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { getBareMetalDiscoveryInitialValues } from '../clusterConfiguration/utils';
import { getOlmOperatorsByName } from '../clusters/utils';

const BaremetalDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { alerts, addAlert, clearAlerts } = React.useContext(AlertsContext);

  const handleSubmit = async (
    values: BareMetalDiscoveryValues,
    formikActions: FormikHelpers<BareMetalDiscoveryValues>,
  ) => {
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
      formikActions.resetForm({
        values: getBareMetalDiscoveryInitialValues(data),
      });
      dispatch(updateCluster(data));

      canNextBaremetalDiscovery({ cluster: data }) && setCurrentStepId('networking');
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik initialValues={getBareMetalDiscoveryInitialValues(cluster)} onSubmit={handleSubmit}>
      {({
        isSubmitting,
        isValid,
        dirty,
        errors,
        submitForm,
      }: FormikProps<BareMetalDiscoveryValues>) => {
        const footer = (
          <Stack hasGutter>
            {!!alerts.length && (
              <StackItem>
                <Alerts />
              </StackItem>
            )}
            <StackItem>
              <ClusterWizardToolbar
                cluster={cluster}
                dirty={dirty}
                formErrors={errors}
                isSubmitting={isSubmitting}
                isNextDisabled={!(isValid && (dirty || canNextBaremetalDiscovery({ cluster })))}
                onNext={submitForm}
                onBack={() => setCurrentStepId('cluster-details')}
              />
            </StackItem>
          </Stack>
        );

        return (
          <ClusterWizardStep cluster={cluster} footer={footer}>
            <BaremetalInventory cluster={cluster} />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default BaremetalDiscovery;
