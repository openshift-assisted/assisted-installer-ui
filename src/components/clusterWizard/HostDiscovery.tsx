import React from 'react';
import { shallowEqual, useDispatch } from 'react-redux';
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
import { OPERATOR_NAME_CNV, OPERATOR_NAME_LSO, OPERATOR_NAME_OCS } from '../../config';
import { ClusterPreflightRequirementsContextProvider } from '../clusterConfiguration/ClusterPreflightRequirementsContext';

const HostDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const initialValues = React.useMemo(() => getHostDiscoveryInitialValues(cluster), [cluster]);

  const handleSubmit = async (values: HostDiscoveryValues) => {
    clearAlerts();

    const params: ClusterUpdateParams = {};

    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster.monitoredOperators);
    const setOperator = (name: string, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };

    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);
    setOperator(OPERATOR_NAME_OCS, values.useExtraDisksForLocalStorage);
    // TODO(jtomasek): remove following once enabling OCS is moved into a separate storage step and LSO option is exposed to the user
    if (!values.useExtraDisksForLocalStorage && !values.useContainerNativeVirtualization) {
      setOperator(OPERATOR_NAME_LSO, false);
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
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting, errors, values }: FormikProps<HostDiscoveryValues>) => {
        // Workaround, Formik's "dirty" stays true unless we use enableReinitialize or play with resetForm()
        const isFormikDirty = !shallowEqual(values, initialValues);
        const footer = (
          <ClusterWizardToolbar
            cluster={cluster}
            dirty={isFormikDirty}
            formErrors={errors}
            isSubmitting={isSubmitting}
            isNextDisabled={isFormikDirty || !canNextHostDiscovery({ cluster })}
            onNext={() => setCurrentStepId('networking')}
            onBack={() => setCurrentStepId('cluster-details')}
          />
        );

        return (
          <ClusterWizardStep cluster={cluster} footer={footer}>
            <ClusterPreflightRequirementsContextProvider clusterId={cluster.id}>
              <HostInventory cluster={cluster} />
            </ClusterPreflightRequirementsContextProvider>
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default HostDiscovery;
