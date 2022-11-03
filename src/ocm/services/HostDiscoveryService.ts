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
  ): void {
    const type = platformToIntegrate === undefined ? 'none' : platformToIntegrate;
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
