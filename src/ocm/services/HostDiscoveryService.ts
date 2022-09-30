import {
  Cluster,
  V2ClusterUpdateParams,
  HostDiscoveryValues,
  selectMastersMustRunWorkloads,
} from '../../common';

const HostDiscoveryService = {
  setPlatform(
    params: V2ClusterUpdateParams,
    usePlatformIntegration: boolean,
    isClusterPlatformTypeVsphere: boolean,
    isClusterPlatformTypeNutanix: boolean,
  ): void {
    if (usePlatformIntegration && (isClusterPlatformTypeVsphere || isClusterPlatformTypeNutanix)) {
      params.platform = {
        type: isClusterPlatformTypeVsphere ? 'vsphere' : 'nutanix',
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
