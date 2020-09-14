import { Netmask } from 'netmask';
import { HostSubnets, ClusterConfigurationValues } from '../../types/clusters';
import { Cluster, Inventory, ManagedDomain } from '../../api/types';
import { stringToJSON } from '../../api/utils';

export const NO_SUBNETS_AVAILABLE = 'No subnets available';

const findMatchingSubnet = (
  ingressVip: string | undefined,
  apiVip: string | undefined,
  hostSubnets: HostSubnets,
): string => {
  let matchingSubnet;
  if (hostSubnets.length) {
    if (!ingressVip && !apiVip) {
      matchingSubnet = hostSubnets[0];
    } else {
      matchingSubnet =
        hostSubnets.find((hn) => {
          let found = true;
          if (ingressVip) {
            found = found && hn.subnet.contains(ingressVip);
          }
          if (apiVip) {
            found = found && hn.subnet.contains(apiVip);
          }
          return found;
        }) || hostSubnets[0];
    }
  }
  return matchingSubnet ? matchingSubnet.humanized : NO_SUBNETS_AVAILABLE;
};

export const getHostSubnets = (cluster: Cluster): HostSubnets => {
  const hostnameMap: { [id: string]: string } =
    cluster.hosts?.reduce((acc, host) => {
      const inventory = stringToJSON<Inventory>(host.inventory) || {};
      acc = {
        ...acc,
        [host.id]: inventory.hostname,
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

export const getInitialValues = (
  cluster: Cluster,
  managedDomains: ManagedDomain[],
): ClusterConfigurationValues => ({
  name: cluster.name || '',
  baseDnsDomain: cluster.baseDnsDomain || '',
  clusterNetworkCidr: cluster.clusterNetworkCidr || '',
  clusterNetworkHostPrefix: cluster.clusterNetworkHostPrefix || 0,
  serviceNetworkCidr: cluster.serviceNetworkCidr || '',
  apiVip: cluster.apiVip || '',
  ingressVip: cluster.ingressVip || '',
  sshPublicKey: cluster.sshPublicKey || '',
  hostSubnet: findMatchingSubnet(cluster.ingressVip, cluster.apiVip, getHostSubnets(cluster)),
  useRedHatDnsService:
    !!cluster.baseDnsDomain && managedDomains.map((d) => d.domain).includes(cluster.baseDnsDomain),
  shareDiscoverySshKey:
    !!cluster.imageInfo.sshPublicKey && cluster.sshPublicKey === cluster.imageInfo.sshPublicKey,
  vipDhcpAllocation: cluster.vipDhcpAllocation,
});
