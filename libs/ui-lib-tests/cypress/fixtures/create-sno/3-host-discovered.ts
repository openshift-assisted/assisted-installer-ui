/* eslint-disable @typescript-eslint/naming-convention */

import { hostIPs, hostIds } from '../hosts';

import { clusterValidationsInfo } from '../cluster/validation-info-host-discovery';

const snoHostIP = hostIPs[0];
const snoHostID = hostIds[0];

const hostDiscoveredBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '3-host-discovered',
    enabled_host_count: 1,
    total_host_count: 1,
    host_networks: [
      {
        cidr: snoHostIP,
        host_ids: [snoHostID],
      },
    ],
    validations_info: JSON.stringify(clusterValidationsInfo),
    connectivity_majority_groups: {
      ...baseCluster.connectivity_majority_groups,
      [snoHostIP]: [],
    },
    status: 'pending-for-input',
    status_info: 'User input required',
  };
};

export { hostDiscoveredBuilder };
