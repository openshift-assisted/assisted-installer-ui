import React from 'react';
import StorageStep from './StorageStep';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, FormikProps } from 'formik';
import {
  Cluster,
  ClusterUpdateParams,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterWizardStep,
  useAlerts,
  getHostDiscoveryInitialValues,
} from '../../../common';
import { HostDiscoveryValues } from '../../../common/types/clusters';
import HostInventory from '../clusterConfiguration/HostInventory';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
//import { canNextHostDiscovery } from './wizardTransition';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { updateCluster } from '../../reducers/clusters/currentClusterSlice';
import ClusterWizardFooter from '../clusterWizard/ClusterWizardFooter';

import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';
import { ClustersAPI } from '../../services/apis';
import HostDiscoveryService from '../../services/HostDiscoveryService';

const Storage: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  //const dispatch = useDispatch();
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

    // const params: ClusterUpdateParams = {};
    // HostDiscoveryService.setPlatform(params, values.usePlatformIntegration);
    // HostDiscoveryService.setOLMOperators(params, values, cluster.monitoredOperators);
    // HostDiscoveryService.setSchedulableMasters(params, values, cluster);
    //
    // try {
    //   const { data } = await ClustersAPI.update(cluster.id, params);
    //   dispatch(updateCluster(data));
    //   actions.resetForm({ values: getHostDiscoveryInitialValues(data) });
    // } catch (e) {
    //   handleApiError(e, () =>
    //     addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
    //   );
    // }
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
            //isNextDisabled={dirty || !canNextHostDiscovery({ cluster })}
            onNext={() => setCurrentStepId('networking')}
            onBack={() => setCurrentStepId('host-discovery')}
          />
        );

        return (
          <ClusterWizardStep
            navigation={<ClusterWizardNavigation cluster={cluster} />}
            footer={footer}
          >
            <StorageStep cluster={cluster} />
            <FormikAutoSave />
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default Storage;
