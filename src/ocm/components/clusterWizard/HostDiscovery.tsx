import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, FormikProps } from 'formik';
import {
  Cluster,
  ClusterUpdateParams,
  getFormikErrorFields,
  FormikAutoSave,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_OCS,
  ClusterWizardStep,
  useAlerts,
  getHostDiscoveryInitialValues,
  MonitoredOperator,
} from '../../../common';
import { HostDiscoveryValues } from '../../../common/types/clusters';
import HostInventory from '../clusterConfiguration/HostInventory';
import ClusterWizardContext from './ClusterWizardContext';
import { canNextHostDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { patchCluster } from '../../api/clusters';
import { updateCluster } from '../../reducers/clusters/currentClusterSlice';
import { getOlmOperatorCreateParamsByName } from '../clusters/utils';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';

const setPlatform = (params: ClusterUpdateParams, usePlatformIntegration: boolean) => {
  if (usePlatformIntegration) {
    params.platform = {
      type: 'vsphere',
      vsphere: {},
    };
  } else {
    params.platform = {
      type: 'baremetal',
    };
  }
};

const setOLMOperators = (
  params: ClusterUpdateParams,
  values: HostDiscoveryValues,
  monitoredOperators: MonitoredOperator[] = [],
) => {
  const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(monitoredOperators);
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
};

const HostDiscovery: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const { addAlert, clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getHostDiscoveryInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const handleSubmit: FormikConfig<HostDiscoveryValues>['onSubmit'] = async (
    values: HostDiscoveryValues,
    actions,
  ) => {
    clearAlerts();

    const params: ClusterUpdateParams = {};
    setPlatform(params, values.usePlatformIntegration);
    setOLMOperators(params, values, cluster.monitoredOperators);

    try {
      const { data } = await patchCluster(cluster.id, params);
      dispatch(updateCluster(data));
      actions.resetForm({ values: getHostDiscoveryInitialValues(data) });
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting, dirty, errors, touched }: FormikProps<HostDiscoveryValues>) => {
        const errorFields = getFormikErrorFields(errors, touched);

        const footer = (
          <ClusterWizardFooter
            cluster={cluster}
            errorFields={errorFields}
            isSubmitting={isSubmitting}
            isNextDisabled={dirty || !canNextHostDiscovery({ cluster })}
            onNext={() => setCurrentStepId('networking')}
            onBack={() => setCurrentStepId('cluster-details')}
          />
        );

        return (
          <ClusterWizardStep
            navigation={<ClusterWizardNavigation cluster={cluster} />}
            footer={footer}
          >
            <HostInventory cluster={cluster} />
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default HostDiscovery;
