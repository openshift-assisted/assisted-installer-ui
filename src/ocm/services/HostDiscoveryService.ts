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
