import { Netmask } from 'netmask';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { Cluster, Inventory, ManagedDomain } from '../../api/types';
import { stringToJSON } from '../../api/utils';
import { computeHostname } from '../hosts/Hostname';

export const NO_SUBNET_SET = 'NO_SUBNET_SET';

export const getHostSubnets = (cluster: Cluster): HostSubnets => {
  const hostnameMap: { [id: string]: string } =
    cluster.hosts?.reduce((acc, host) => {
      const inventory = stringToJSON<Inventory>(host.inventory) || {};
      acc = {
        ...acc,
        [host.id]: computeHostname(host, inventory),
      };
      return acc;
    }, {}) || {};

  return (
    cluster.hostNetworks?.map((hn) => {
      const subnet = new Netmask(hn.cidr as string);
      return {
        subnet,
        hostIDs: hn.hostIds?.map((id) => hostnameMap[id] || id) || [],
        humanized: `${subnet.toString()} (${subnet.first}-${subnet.last})`,
      };
    }) || []
  );
};

export const getSubnetFromMachineNetworkCidr = (machineNetworkCidr?: string) => {
  if (!machineNetworkCidr) {
    return NO_SUBNET_SET;
  }
  const subnet = new Netmask(machineNetworkCidr);
  return `${subnet.toString()} (${subnet.first}-${subnet.last})`;
};

export const getInitialValues = (
  cluster: Cluster,
  managedDomains: ManagedDomain[],
): ClusterConfigurationValues => ({
  name: cluster.name || '',
  baseDnsDomain: cluster.baseDnsDomain || '',
  clusterNetworkCidr: cluster.clusterNetworkCidr || '',
  clusterNetworkHostPrefix: cluster.clusterNetworkHostPrefix || 0,
  serviceNetworkCidr: cluster.serviceNetworkCidr || '',
  apiVip: cluster.vipDhcpAllocation ? '' : cluster.apiVip || '',
  ingressVip: cluster.vipDhcpAllocation ? '' : cluster.ingressVip || '',
  sshPublicKey: cluster.sshPublicKey || '',
  hostSubnet: getSubnetFromMachineNetworkCidr(cluster.machineNetworkCidr),
  useRedHatDnsService:
    !!cluster.baseDnsDomain && managedDomains.map((d) => d.domain).includes(cluster.baseDnsDomain),
  shareDiscoverySshKey:
    !!cluster.imageInfo.sshPublicKey && cluster.sshPublicKey === cluster.imageInfo.sshPublicKey,
  vipDhcpAllocation: cluster.vipDhcpAllocation,
});
