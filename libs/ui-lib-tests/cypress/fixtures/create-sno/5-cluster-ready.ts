/* eslint-disable @typescript-eslint/naming-convention */

import { fakeClusterId } from '../cluster/base-cluster';
import { clusterValidationsInfo } from '../cluster/validation-info-cluster-ready';

const clusterReadyBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '5-cluster-ready',
    status: 'ready',
    status_info: 'Cluster ready to be installed',
    validations_info: JSON.stringify(clusterValidationsInfo),
    machine_networks: [
      {
        cidr: '192.168.122.0/24',
        cluster_id: fakeClusterId,
      },
    ],
    api_vip: '192.168.122.10',
    api_vips: [{ ip: '192.168.122.10', cluster_id: fakeClusterId }],
    ingress_vip: '192.168.122.110',
    ingress_vips: [{ ip: '192.168.122.110', cluster_id: fakeClusterId }],
  };
};

export { clusterReadyBuilder };
