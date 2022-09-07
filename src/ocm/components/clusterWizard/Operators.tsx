import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  ClusterWizardStep,
  OperatorsValues,
  useAlerts,
  getFormikErrorFields,
  useFormikAutoSave,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_OCS,
} from '../../../common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from '../clusterWizard/ClusterWizardFooter';
import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';
import { OperatorsStep } from './OperatorsStep';
import { ClustersService, OperatorsService } from '../../services';
import { updateCluster } from '../../reducers/clusters';
import { handleApiError } from '../../api';
import { canNextOperators } from './wizardTransition';
import { getErrorMessage } from '../../../common/utils';

export const getOperatorsInitialValues = (cluster: Cluster): OperatorsValues => {
  const monitoredOperators = cluster.monitoredOperators || [];
  const isOperatorEnabled = (operatorNames: string[]) =>
    !!monitoredOperators.find((operator) => operatorNames.includes(operator.name || ''));
  return {
    useOpenShiftDataFoundation: isOperatorEnabled([OPERATOR_NAME_ODF, OPERATOR_NAME_OCS]),
    useOdfLogicalVolumeManager: isOperatorEnabled([OPERATOR_NAME_LVM]),
    useContainerNativeVirtualization: isOperatorEnabled([OPERATOR_NAME_CNV]),
  };
};

const OperatorsForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<OperatorsValues>();
  const clusterWizardContext = useClusterWizardContext();
  const errorFields = getFormikErrorFields(errors, touched);
  const isAutoSaveRunning = useFormikAutoSave();
  const isNextDisabled =
    isAutoSaveRunning ||
    !isValid ||
    !!alerts.length ||
    isSubmitting ||
    !canNextOperators({ cluster });

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      errorFields={errorFields}
      isSubmitting={isSubmitting}
      isNextDisabled={isNextDisabled}
      onNext={() => clusterWizardContext.moveNext()}
      onBack={() => clusterWizardContext.moveBack()}
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <OperatorsStep clusterId={cluster.id} openshiftVersion={cluster.openshiftVersion} />
    </ClusterWizardStep>
  );
};

const Operators = ({ cluster }: { cluster: Cluster }) => {
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();
  const initialValues = React.useMemo(
    () => getOperatorsInitialValues(cluster),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const handleSubmit: FormikConfig<OperatorsValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const enabledOperators = OperatorsService.getOLMOperators(values, cluster);

    try {
      const { data } = await ClustersService.update(cluster.id, cluster.tags, {
        olmOperators: enabledOperators,
      });
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
