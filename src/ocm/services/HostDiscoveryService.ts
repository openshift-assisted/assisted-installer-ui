import {
  ClusterUpdateParams,
  HostDiscoveryValues,
  MonitoredOperator,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_OCS,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';

const HostDiscoveryService = {
  setPlatform(params: ClusterUpdateParams, usePlatformIntegration: boolean) {
    if (usePlatformIntegration) {
      params.platform = {
        type: 'vsphere',
        vsphere: {},
      };
    } else {
      params.platform = {
        type: 'baremetal',
      };
    }
  },

  setOLMOperators(
    params: ClusterUpdateParams,
    values: HostDiscoveryValues,
    monitoredOperators: MonitoredOperator[] = [],
  ) {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(monitoredOperators);
    const setOperator = (name: string, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };

    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);
    setOperator(OPERATOR_NAME_OCS, values.useExtraDisksForLocalStorage);
    // TODO(jtomasek): remove following once enabling OCS is moved into a separate storage step and LSO option is exposed to the user
    if (!values.useExtraDisksForLocalStorage && !values.useContainerNativeVirtualization) {
      setOperator(OPERATOR_NAME_LSO, false);
    }

    params.olmOperators = Object.values(enabledOlmOperatorsByName);
  },
};

export default HostDiscoveryService;
