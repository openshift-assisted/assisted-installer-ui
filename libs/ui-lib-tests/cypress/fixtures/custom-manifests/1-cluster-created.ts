/* eslint-disable @typescript-eslint/naming-convention */

import { baseCluster, fakeClusterId } from '../cluster/base-cluster';
import { initialClusterValidations } from '../cluster/validation-info-initial-cluster';

const featureUsage = {
  'SDN network type': {
    id: 'SDN_NETWORK_TYPE',
    name: 'SDN network type',
  },
  'VIP auto alloc.': {
    id: 'VIP_AUTO_ALLOC',
    name: 'VIP auto alloc.',
  },
};

const customManifestsCluster = {
  ...baseCluster('ai-e2e-custom-manifests'),
  cluster_networks: [
    {
      cidr: '10.128.0.0/14',
      cluster_id: fakeClusterId,
      host_prefix: 23,
    },
  ],
  service_networks: [
    {
      cidr: '172.30.0.0/16',
      cluster_id: fakeClusterId,
    },
  ],
  machine_networks: [
    {
      cidr: '192.168.122.0/24',
      cluster_id: fakeClusterId,
    },
  ],
  // We're adding this field to easily debug which mock is returning the response
  feature_usage: JSON.stringify(featureUsage),
  high_availability_mode: 'Full',
  network_type: 'OpenShiftSDN',
  user_managed_networking: false,
  vip_dhcp_allocation: true,
  e2e_mock_source: '5-cluster-ready',
  status: 'ready',
  status_info: 'Cluster ready to be installed',
  validations_info: JSON.stringify(initialClusterValidations.clusterValidationsInfo),
};

export { customManifestsCluster };
