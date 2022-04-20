import {
  OperatorsValues,
  MonitoredOperator,
  V2ClusterUpdateParams,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_OCS,
  OPERATOR_NAME_LSO,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';
const OperatorsService = {
  setOLMOperators(
    params: V2ClusterUpdateParams,
    values: OperatorsValues,
    monitoredOperators: MonitoredOperator[] = [],
  ): void {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(monitoredOperators);
    const setOperator = (name: string, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };
    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);
    // TODO(jkilzi): remove traces of OCS once it's fully deprecated/renamed to ODF
    setOperator(
      OPERATOR_NAME_ODF in enabledOlmOperatorsByName ? OPERATOR_NAME_ODF : OPERATOR_NAME_OCS,
      values.useExtraDisksForLocalStorage,
    );
    // TODO(jtomasek): remove following once enabling OCS is moved into a separate storage step and LSO option is exposed to the user
    if (!values.useExtraDisksForLocalStorage && !values.useContainerNativeVirtualization) {
      setOperator(OPERATOR_NAME_LSO, false);
    }
    params.olmOperators = Object.values(enabledOlmOperatorsByName);
  },
};
export default OperatorsService;
