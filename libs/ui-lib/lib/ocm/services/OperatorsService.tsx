import {
  OperatorsValues,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_LVM,
  OperatorName,
  OPERATOR_NAME_MCE,
  OPERATOR_NAME_MTV,
  OPERATOR_NAME_OPENSHIFT_AI,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';
import { getKeys } from '../../common/utils';
import {
  Cluster,
  OperatorCreateParams,
} from '@openshift-assisted/types/assisted-installer-service';

const hasActiveOperators = (values: OperatorsValues) => {
  return getKeys(values).some((operatorParam) => values[operatorParam]);
};

const OperatorsService = {
  getOLMOperators(values: OperatorsValues, cluster: Cluster): OperatorCreateParams[] {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster);

    // TODO: change OperatorName to ExposedOperatorName once the LSO option is exposed to the user
    const setOperator = (name: OperatorName, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };

    setOperator(OPERATOR_NAME_LVM, values.useOdfLogicalVolumeManager);
    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);
    setOperator(OPERATOR_NAME_ODF, values.useOpenShiftDataFoundation);
    setOperator(OPERATOR_NAME_MCE, values.useMultiClusterEngine);
    setOperator(OPERATOR_NAME_MTV, values.useMigrationToolkitforVirtualization);
    setOperator(OPERATOR_NAME_OPENSHIFT_AI, values.useOpenShiftAI);

    // TODO: remove following once the LSO option is exposed to the user
    if (!hasActiveOperators(values)) {
      setOperator(OPERATOR_NAME_LSO, false);
    }

    return Object.values(enabledOlmOperatorsByName);
  },

  /**
   * Depending on the Openshift version and certain selected operators, the
   * Backend can activate some other operators.
   * We need to synchronise them back to the form
   */
  syncOperators(
    uiOperators: OperatorCreateParams[],
    updatedOperators: Cluster['monitoredOperators'],
  ): Partial<OperatorsValues> {
    const updates: Partial<OperatorsValues> = {};

    // LVM operator can be automatically selected depending on Openshift version + other operators
    const lvmPrevInactive = uiOperators?.find((op) => op.name === OPERATOR_NAME_LVM) === undefined;
    const lvmNowActive =
      updatedOperators?.find((op) => op.name === OPERATOR_NAME_LVM) !== undefined;
    if (lvmPrevInactive && lvmNowActive) {
      updates.useOdfLogicalVolumeManager = true;
    }

    // ODF operator will be automatically selected when the OpenShift AI operator is selected:
    const odfPrevInactive = uiOperators?.find((op) => op.name === OPERATOR_NAME_ODF) === undefined;
    const odfNowActive =
      updatedOperators?.find((op) => op.name === OPERATOR_NAME_ODF) !== undefined;
    if (odfPrevInactive && odfNowActive) {
      updates.useOpenShiftDataFoundation = true;
    }

    return updates;
  },
};
export default OperatorsService;
