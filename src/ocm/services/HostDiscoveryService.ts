import {
  Cluster,
  V2ClusterUpdateParams,
  HostDiscoveryValues,
  MonitoredOperator,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_OCS,
  OPERATOR_NAME_ODF,
  schedulableMastersAlwaysOn,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';

const HostDiscoveryService = {
  setPlatform(params: V2ClusterUpdateParams, usePlatformIntegration: boolean): void {
    if (usePlatformIntegration) {
      params.platform = {
        type: 'vsphere',
      };
    } else {
      params.platform = {
        type: 'baremetal',
      };
    }
  },

  setOLMOperators(
    params: V2ClusterUpdateParams,
    values: HostDiscoveryValues,
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

  setSchedulableMasters(
    params: V2ClusterUpdateParams,
    values: HostDiscoveryValues,
    cluster: Cluster,
  ): void {
    if (!schedulableMastersAlwaysOn(cluster)) {
      /*
        backend shouldn't be updated with the schedulable masters when there are less than 5 hosts,
        it'll mess up getting false for the default value when there are 5 hosts and up
      */
      params.schedulableMasters = values.schedulableMasters;
    }
  },
};

export default HostDiscoveryService;
