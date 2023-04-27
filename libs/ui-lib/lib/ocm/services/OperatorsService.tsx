import {
  Cluster,
  OperatorsValues,
  OperatorCreateParams,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_LVM,
  OperatorName,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';
import { getKeys } from '../../common/utils';

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
    // LVM operator can be automatically selected depending on Openshift version + other operators
    const prevInactive = uiOperators?.find((op) => op.name === OPERATOR_NAME_LVM) === undefined;
    const nowActive = updatedOperators?.find((op) => op.name === OPERATOR_NAME_LVM) !== undefined;

    const updates: Partial<OperatorsValues> = {};
    if (prevInactive && nowActive) {
      updates.useOdfLogicalVolumeManager = true;
    }
    return updates;
  },
};
export default OperatorsService;
