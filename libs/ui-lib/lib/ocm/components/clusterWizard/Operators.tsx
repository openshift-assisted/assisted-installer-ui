import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { Formik, FormikConfig, useFormikContext } from 'formik';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStep,
  getFormikErrorFields,
  OperatorsValues,
  selectOlmOperators,
  UISettingsValues,
  useAlerts,
  useFormikAutoSave,
} from '../../../common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from '../clusterWizard/ClusterWizardFooter';
import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';
import { OperatorsStep } from './OperatorsStep';
import { ClustersService } from '../../services';
import { setServerUpdateError, updateCluster } from '../../store/slices/current-cluster/slice';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../../common/api';
import { canNextOperators } from './wizardTransition';

// Balance debounce time: fast clicks should trigger a single API call,
// but making it shorter will allow us to disable navigation buttons while changes are pending
const operatorsAutoSaveDebounce = 500;

const getOperatorsInitialValues = (
  uiSettings: UISettingsValues | undefined,
  cluster: Cluster,
): OperatorsValues => {
  const olmOperators = selectOlmOperators(cluster);
  const operatorProperties: Record<string, string> = {};

  olmOperators.forEach((op) => {
    if (op.name && op.properties) {
      operatorProperties[op.name] = op.properties;
    }
  });

  return {
    selectedBundles: uiSettings?.bundlesSelected || [],
    selectedOperators: olmOperators.map((o) => o.name || ''),
    operatorProperties: operatorProperties || {},
  };
};

const OperatorsForm = ({ cluster }: { cluster: Cluster }) => {
  const { alerts } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const isAutoSaveRunning = useFormikAutoSave(operatorsAutoSaveDebounce);
  const { errors, touched, isSubmitting, isValid } = useFormikContext<OperatorsValues>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isNextDisabled =
    isAutoSaveRunning ||
    !isValid ||
    !!alerts.length ||
    isSubmitting ||
    !canNextOperators({ cluster });

  const handleNext = () => {
    if (window.location.pathname.indexOf('assisted-installer') > -1) {
      navigate(pathname, { state: undefined, replace: true });
    }
    clusterWizardContext.moveNext();
  };

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation cluster={cluster} />}
      footer={
        <ClusterWizardFooter
          cluster={cluster}
          errorFields={getFormikErrorFields(errors, touched)}
          isSubmitting={isSubmitting}
          isNextDisabled={isNextDisabled}
          onNext={handleNext}
          onBack={() => clusterWizardContext.moveBack()}
          isBackDisabled={isSubmitting || isAutoSaveRunning}
        />
      }
    >
      <OperatorsStep cluster={cluster} />
    </ClusterWizardStep>
  );
};

const Operators = ({ cluster }: { cluster: Cluster }) => {
  const dispatch = useDispatch();
  const { updateUISettings, uiSettings } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();

  const handleSubmit: FormikConfig<OperatorsValues>['onSubmit'] = async (values) => {
    clearAlerts();

    const enabledOperators = values.selectedOperators.map((so) => {
      const operator: { name: string; properties?: string } = { name: so };
      if (values.operatorProperties[so]) {
        operator.properties = values.operatorProperties[so];
      }
      return operator;
    });

    try {
      const { data: updatedCluster } = await ClustersService.update(cluster.id, cluster.tags, {
        olmOperators: enabledOperators,
      });

      await updateUISettings({ bundlesSelected: values.selectedBundles });

      dispatch(updateCluster(updatedCluster));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getApiErrorMessage(e) }),
      );
      if (isUnknownServerError(e as Error)) {
        dispatch(setServerUpdateError());
      }
    }
  };

  const initialValues = React.useMemo(
    () => getOperatorsInitialValues(uiSettings, cluster),
    [uiSettings, cluster],
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <OperatorsForm cluster={cluster} />
    </Formik>
  );
};

export default Operators;
