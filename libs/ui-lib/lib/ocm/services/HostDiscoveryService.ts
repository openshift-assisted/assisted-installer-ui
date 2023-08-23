import { HostDiscoveryValues, selectMastersMustRunWorkloads } from '../../common';
import {
  Cluster,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';

const HostDiscoveryService = {
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
