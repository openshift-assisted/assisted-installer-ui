/* eslint-disable @typescript-eslint/naming-convention */
import { baseCluster, fakeClusterId } from '../cluster/base-cluster';
import { clusterValidationsInfo } from '../cluster/validation-info-host-renamed';
import { hostIds } from '../hosts';

const connectivityMajorityGroups = {
  IPv4: [],
  IPv6: [],
};

const featureUsage = {
  'SDN network type': {
    id: 'SDN_NETWORK_TYPE',
    name: 'SDN network type',
  },
  'VIP auto alloc.': {
    id: 'VIP_AUTO_ALLOC',
    name: 'VIP auto alloc.',
  },
  'Requested hostname': {
    data: {
      host_count: 3,
    },
    id: 'REQUESTED_HOSTNAME',
    name: 'Requested hostname',
  },
};

const featureUsageDualstack = {
  'OVN network type': {
    id: 'OVN_NETWORK_TYPE',
    name: 'OVN network type',
  },
  'Requested hostname': {
    data: {
      host_count: 3,
    },
    id: 'REQUESTED_HOSTNAME',
    name: 'Requested hostname',
  },
  'Dual-stack': {
    id: 'DUAL-STACK',
    name: 'Dual-stack',
  },
};

const dualstackClusterBase = {
  ...baseCluster('ai-e2e-dualstack'),
  apiVip: '192.168.122.10',
  ingressVip: '192.168.122.110',
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
  host_networks: [
    {
      cidr: '192.168.122.0/24',
      host_ids: hostIds,
    },
    {
      cidr: '1001:db9::/120',
      host_ids: hostIds,
    },
  ],
  // We're adding this field to easily debug which mock is returning the response
  e2e_mock_source: '1-dualstack-base',
  feature_usage: JSON.stringify(featureUsage),
  high_availability_mode: 'Full',
  network_type: 'OpenShiftSDN',
  user_managed_networking: false,
  vip_dhcp_allocation: false,
  connectivity_majority_groups: JSON.stringify(connectivityMajorityGroups),
  validations_info: JSON.stringify(clusterValidationsInfo),
  enabled_host_count: 3,
  total_host_count: 3,
  status: 'pending-for-input',
  status_info: 'User input required',
};

const addNetworkItem = (networkItems, data) => {
  return networkItems.concat([{ ...data, clusterId: fakeClusterId }]);
};

const withDualStackNetworks = (singleStackCluster) => ({
  ...singleStackCluster,
  cluster_networks: addNetworkItem(singleStackCluster.cluster_networks, {
    cidr: 'fd01::/48',
    host_prefix: 64,
  }),
  service_networks: addNetworkItem(singleStackCluster.service_networks, {
    cidr: 'fd02::/112',
  }),
  machine_networks: addNetworkItem(singleStackCluster.machine_networks, {
    cidr: '1001:db9::/120',
  }),
  // We're adding this field to easily debug which mock is returning the response
  e2e_mock_source: '1-dualstack-dualstack',
  feature_usage: JSON.stringify(featureUsageDualstack),
  validations_info: JSON.stringify(clusterValidationsInfo),
  high_availability_mode: 'Full',
  network_type: 'OVNKubernetes',
  user_managed_networking: false,
  vip_dhcp_allocation: false,
});

export { dualstackClusterBase, withDualStackNetworks };
