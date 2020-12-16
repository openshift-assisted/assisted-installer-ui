import {
  BareMetalDiscoveryValues,
  HostSubnets,
  NetworkConfigurationValues,
} from '../../types/clusters';
import { Cluster, Inventory, ManagedDomain } from '../../api/types';
import { stringToJSON } from '../../api/utils';
import {
  CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4,
  CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV6,
} from '../../config/constants';
import { Address4, Address6 } from 'ip-address';
import { getHostname } from '../hosts/utils';
import { ClusterNetworkDefaultSettings } from './types';
import { NO_SUBNET_SET } from '../../config/constants';

export const getSubnet = (cidr: string): Address6 | Address4 | null => {
  if (Address4.isValid(cidr)) {
    return new Address4(cidr);
  } else if (Address6.isValid(cidr)) {
    return new Address6(cidr);
  } else {
    return null;
  }
};

const getHumanizedSubnet = (subnet: Address6 | Address4 | null) => {
  if (subnet) {
    const subnetStart = subnet.startAddress().correctForm();
    const subnetEnd = subnet.endAddress().correctForm();
    return `${subnet.address} (${subnetStart} - ${subnetEnd})`;
  }

  return '';
};

export const getHostSubnets = (cluster: Cluster): HostSubnets => {
  const hostnameMap: { [id: string]: string } =
    cluster.hosts?.reduce((acc, host) => {
      const inventory = stringToJSON<Inventory>(host.inventory) || {};
      acc = {
        ...acc,
        [host.id]: getHostname(host, inventory),
      };
      return acc;
    }, {}) || {};

  return (
    cluster.hostNetworks?.map((hn) => {
      return {
        subnet: hn.cidr || '',
        hostIDs: hn.hostIds?.map((id) => hostnameMap[id] || id) || [],
        humanized: getHumanizedSubnet(getSubnet(hn.cidr as string)),
      };
    }) || []
  );
};

export const getSubnetFromMachineNetworkCidr = (machineNetworkCidr?: string) => {
  if (!machineNetworkCidr) {
    return NO_SUBNET_SET;
  }

  const subnet = getSubnet(machineNetworkCidr);
  return getHumanizedSubnet(subnet);
};

const getDefaultNetworkSettings = (clusterNetworkCidr: string): ClusterNetworkDefaultSettings => {
  const isIPv4 = Address4.isValid(clusterNetworkCidr);
  return {
    clusterNetworkCidr: isIPv4
      ? CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4.clusterNetworkCidr
      : CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV6.clusterNetworkCidr,
    serviceNetworkCidr: isIPv4
      ? CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4.serviceNetworkCidr
      : CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV6.serviceNetworkCidr,
    clusterNetworkHostPrefix: isIPv4
      ? CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV4.clusterNetworkHostPrefix
      : CLUSTER_DEFAULT_NETWORK_SETTINGS_IPV6.clusterNetworkHostPrefix,
  };
};

// TODO: Replace this by API call to retrieve the defaults from the backend
export const getClusterDefaultSettings = (clusterNetworkCidr: string) => ({
  ...getDefaultNetworkSettings(clusterNetworkCidr),
});

export const isAdvConf = (cluster: Cluster) => {
  const defaultNetworkSettings = getDefaultNetworkSettings(cluster.clusterNetworkCidr as string);
  return (
    cluster.clusterNetworkCidr !== defaultNetworkSettings.clusterNetworkCidr ||
    cluster.clusterNetworkHostPrefix !== defaultNetworkSettings.clusterNetworkHostPrefix ||
    cluster.serviceNetworkCidr !== defaultNetworkSettings.serviceNetworkCidr
  );
};

export const getBareMetalDiscoveryInitialValues = (cluster: Cluster): BareMetalDiscoveryValues => ({
  name: cluster.name || '',
});

export const getNetworkInitialValues = (
  cluster: Cluster,
  managedDomains: ManagedDomain[],
): NetworkConfigurationValues => {
  const defaultNetworkSettings = getDefaultNetworkSettings(cluster.clusterNetworkCidr as string);
  return {
    baseDnsDomain: cluster.baseDnsDomain || '',
    clusterNetworkCidr: cluster.clusterNetworkCidr || defaultNetworkSettings.clusterNetworkCidr,
    clusterNetworkHostPrefix:
      cluster.clusterNetworkHostPrefix || defaultNetworkSettings.clusterNetworkHostPrefix,
    serviceNetworkCidr: cluster.serviceNetworkCidr || defaultNetworkSettings.serviceNetworkCidr,
    apiVip: cluster.vipDhcpAllocation ? '' : cluster.apiVip || '',
    ingressVip: cluster.vipDhcpAllocation ? '' : cluster.ingressVip || '',
    sshPublicKey: cluster.sshPublicKey || '',
    hostSubnet: getSubnetFromMachineNetworkCidr(cluster.machineNetworkCidr),
    useRedHatDnsService:
      !!cluster.baseDnsDomain &&
      managedDomains.map((d) => d.domain).includes(cluster.baseDnsDomain),
    shareDiscoverySshKey:
      !!cluster.imageInfo.sshPublicKey && cluster.sshPublicKey === cluster.imageInfo.sshPublicKey,
    vipDhcpAllocation: cluster.vipDhcpAllocation,
  };
};
