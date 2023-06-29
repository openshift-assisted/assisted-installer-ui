import { fakeClusterId } from '../cluster/base-cluster';

export const UMNetworkingRequest = {
  api_vips: [],
  api_vip: '',
  ingress_vips: [],
  ingress_vip: '',
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
  ssh_public_key: '',
  user_managed_networking: true,
  vip_dhcp_allocation: false,
  network_type: 'OVNKubernetes',
};
