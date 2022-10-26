import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import {
  Cluster,
  ClusterWizardStep,
  getFormikErrorFields,
  MonitoredOperator,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
  OperatorsValues,
  selectMonitoredOperators,
  useAlerts,
  useFormikAutoSave,
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

export const getOperatorsInitialValues = (
  monitoredOperators: MonitoredOperator[],
): OperatorsValues => {
  const isOperatorEnabled = (operatorNames: string[]) =>
    !!monitoredOperators.find((operator) => operatorNames.includes(operator.name || ''));
  return {
    useOpenShiftDataFoundation: isOperatorEnabled([OPERATOR_NAME_ODF]),
    useOdfLogicalVolumeManager: isOperatorEnabled([OPERATOR_NAME_LVM]),
    useContainerNativeVirtualization: isOperatorEnabled([OPERATOR_NAME_CNV]),
  };
};

const OperatorsForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const isAutoSaveRunning = useFormikAutoSave();
  const { errors, touched, isSubmitting, isValid } = useFormikContext<OperatorsValues>();

  const isNextDisabled =
    isAutoSaveRunning ||
    !isValid ||
    !!alerts.length ||
    isSubmitting ||
    !canNextOperators({ cluster });

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation cluster={cluster} />}
      footer={
        <ClusterWizardFooter
          cluster={cluster}
          errorFields={getFormikErrorFields(errors, touched)}
          isSubmitting={isSubmitting}
          isNextDisabled={isNextDisabled}
          onNext={() => clusterWizardContext.moveNext()}
          onBack={() => clusterWizardContext.moveBack()}
        />
      }
    >
      <OperatorsStep clusterId={cluster.id} openshiftVersion={cluster.openshiftVersion} />
    </ClusterWizardStep>
  );
};

const Operators = ({ cluster }: { cluster: Cluster }) => {
  const dispatch = useDispatch();
  const { addAlert, clearAlerts } = useAlerts();

  const olmOperators = selectMonitoredOperators(cluster.monitoredOperators);

  const initialValues = React.useMemo(
    () => getOperatorsInitialValues(olmOperators),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const handleSubmit: FormikConfig<OperatorsValues>['onSubmit'] = async (
    values,
    { setFieldValue },
  ) => {
    clearAlerts();

    const enabledOperators = OperatorsService.getOLMOperators(values, cluster);

    try {
      const { data: updatedCluster } = await ClustersService.update(cluster.id, cluster.tags, {
        olmOperators: enabledOperators,
      });

      const updatedOperators = OperatorsService.getOLMOperators(values, updatedCluster);

      const needSyncOperators = OperatorsService.syncOperators(enabledOperators, updatedOperators);
      Object.keys(needSyncOperators).forEach((operatorName) => {
        setFieldValue(operatorName, true);
      });

      dispatch(updateCluster(updatedCluster));
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
