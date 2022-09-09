import {
  Cluster,
  OperatorsValues,
  OperatorCreateParams,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_OCS,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_LVM,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';

const hasActiveOperators = (values: OperatorsValues) => {
  return Object.keys(values).some((operatorName) => !!values[operatorName]);
};

const OperatorsService = {
  getOLMOperators(values: OperatorsValues, cluster: Cluster): OperatorCreateParams[] {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster);
    const setOperator = (name: string, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };

    setOperator(OPERATOR_NAME_LVM, values.useOdfLogicalVolumeManager);
    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);

    // TODO(jkilzi): remove traces of OCS once it's fully deprecated/renamed to ODF
    setOperator(
      OPERATOR_NAME_ODF in enabledOlmOperatorsByName ? OPERATOR_NAME_ODF : OPERATOR_NAME_OCS,
      values.useOpenShiftDataFoundation,
    );
    // TODO(jtomasek): remove following once enabling OCS is moved into a separate storage step and LSO option is exposed to the user
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
    updatedOperators: OperatorCreateParams[],
  ): Partial<OperatorsValues> {
    // LVM operator can be automatically selected depending on Openshift version + other operators
    const prevInactive = uiOperators?.find((op) => op.name === OPERATOR_NAME_LVM);
    const nowActive = updatedOperators?.find((op) => op.name === OPERATOR_NAME_LVM);

    const updates: Partial<OperatorsValues> = {};
    if (prevInactive && nowActive) {
      updates.useOdfLogicalVolumeManager = true;
    }

    return updates;
  },
};
export default OperatorsService;
