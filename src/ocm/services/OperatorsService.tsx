import {
  Cluster,
  OperatorsValues,
  V2ClusterUpdateParams,
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
  getOLMOperators(
    values: OperatorsValues,
    cluster: Cluster,
  ): V2ClusterUpdateParams['olmOperators'] {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster);
    const setOperator = (name: string, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };

    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);
    setOperator(OPERATOR_NAME_LVM, values.useOdfLogicalVolumeManager);

    // TODO(jkilzi): remove traces of OCS once it's fully deprecated/renamed to ODF
    setOperator(
      OPERATOR_NAME_ODF in enabledOlmOperatorsByName ? OPERATOR_NAME_ODF : OPERATOR_NAME_OCS,
      values.useOpenShiftDataFoundation,
    );
    // TODO(jtomasek): remove following once enabling OCS is moved into a separate storage step and LSO option is exposed to the user
    if (!hasActiveOperators(values)) {
      console.log(
        '%c no operators selected',
        'font-size: 16px; color: blue',
        JSON.stringify(values),
      );

      setOperator(OPERATOR_NAME_LSO, false);
    }

    return Object.values(enabledOlmOperatorsByName);
  },
};
export default OperatorsService;
