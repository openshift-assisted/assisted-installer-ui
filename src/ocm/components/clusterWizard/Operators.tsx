import React from 'react';
import {
  Cluster,
  ClusterWizardStep,
  V2ClusterUpdateParams,
  OperatorsValues,
  useAlerts,
  getFormikErrorFields,
  useFormikAutoSave,
} from '../../../common';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import ClusterWizardFooter from '../clusterWizard/ClusterWizardFooter';
import { OperatorsStep } from './OperatorsStep';
import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import { OperatorsService } from '../../services';
import { ClustersAPI } from '../../services/apis';
import { updateCluster } from '../../reducers/clusters';
import { getErrorMessage, handleApiError } from '../../api';
import { useDispatch } from 'react-redux';
import { canNextOperators } from './wizardTransition';

export const getOperatorsInitialValues = (cluster: Cluster): OperatorsValues => {
  const monitoredOperators = cluster.monitoredOperators || [];
  const isOperatorEnabled = (name: RegExp | string) =>
    !!monitoredOperators.find((operator) => operator.name?.match(name));
  return {
    useExtraDisksForLocalStorage: isOperatorEnabled(/ocs|odf/),
    useContainerNativeVirtualization: isOperatorEnabled('cnv'),
  };
};

const OperatorsForm: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { alerts } = useAlerts();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<OperatorsValues>();
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const errorFields = getFormikErrorFields(errors, touched);
  const isAutoSaveRunning = useFormikAutoSave();
  const isNextDisabled =
    !canNextOperators({ cluster }) ||
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
      onBack={() => setCurrentStepId('cluster-details')}
      onNext={() => setCurrentStepId('host-discovery')}
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <OperatorsStep cluster={cluster} />
    </ClusterWizardStep>
  );
};

const Operators: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getOperatorsInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const handleSubmit: FormikConfig<OperatorsValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const params: V2ClusterUpdateParams = {};
    OperatorsService.setOLMOperators(params, values, cluster.monitoredOperators);

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
      <OperatorsForm cluster={cluster} />
    </Formik>
  );
};

export default Operators;
