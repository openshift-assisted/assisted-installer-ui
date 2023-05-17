/* eslint-disable @typescript-eslint/naming-convention */

import { fakeClusterId } from '../cluster/base-cluster';

export const ipv4NetworkingRequest = {
  ssh_public_key: '',
  vip_dhcp_allocation: false,
  api_vip: '192.168.122.10',
  ingress_vip: '192.168.122.110',
  network_type: 'OVNKubernetes',
  machine_networks: [],
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
  user_managed_networking: false,
};

export const dualStackNetworkingRequest = {
  ssh_public_key: '',
  vip_dhcp_allocation: false,
  network_type: 'OVNKubernetes',
  machine_networks: [
    {
      cidr: '192.168.122.0/24',
      cluster_id: fakeClusterId,
    },
    {
      cidr: '1001:db9::/120',
      cluster_id: fakeClusterId,
    },
  ],
  cluster_networks: [
    {
      cidr: '10.128.0.0/14',
      cluster_id: fakeClusterId,
      host_prefix: 23,
    },
    {
      cidr: 'fd01::/48',
      host_prefix: 64,
    },
  ],
  service_networks: [
    {
      cidr: '172.30.0.0/16',
      cluster_id: fakeClusterId,
    },
    {
      cidr: 'fd02::/112',
    },
  ],
  user_managed_networking: false,
  api_vip: '192.168.122.10',
  ingress_vip: '192.168.122.110',
};
