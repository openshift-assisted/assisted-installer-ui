import {
  Cluster,
  V2ClusterUpdateParams,
  HostDiscoveryValues,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_OCS,
  OPERATOR_NAME_ODF,
  selectMastersMustRunWorkloads,
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
    cluster: Cluster,
  ): void {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster);
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
    // The backend tells us when the control to update schedulable_masters is enabled,
    if (!selectMastersMustRunWorkloads(cluster)) {
      params.schedulableMasters = values.schedulableMasters;
    }
  },
};

export default HostDiscoveryService;
