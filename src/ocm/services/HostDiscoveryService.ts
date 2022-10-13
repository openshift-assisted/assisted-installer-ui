import {
  Cluster,
  V2ClusterUpdateParams,
  HostDiscoveryValues,
  selectMastersMustRunWorkloads,
} from '../../common';
import { PlatformIntegrationType } from '../hooks/useClusterSupportedPlatforms';

const HostDiscoveryService = {
  setPlatform(
    params: V2ClusterUpdateParams,
    platformToIntegrate: PlatformIntegrationType | undefined,
  ): void {
    const type = platformToIntegrate === undefined ? 'baremetal' : platformToIntegrate;
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
