import {
  Cluster,
  V2ClusterUpdateParams,
  HostDiscoveryValues,
  selectMastersMustRunWorkloads,
  SupportedPlatformType,
} from '../../common';

const HostDiscoveryService = {
  setPlatform(
    params: V2ClusterUpdateParams,
    platformToIntegrate: SupportedPlatformType | undefined,
    userManagedNetworking: boolean | undefined,
  ): void {
    //the UI client sends cluster.platform.type=none if UMN is selected.
    //the UI client sends cluster.platform.type=baremetal if UMN is not selected.
    const resetPlatform = userManagedNetworking ? 'none' : 'baremetal';
    const type = platformToIntegrate === undefined ? resetPlatform : platformToIntegrate;
    params.platform = {
      type,
    };
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
