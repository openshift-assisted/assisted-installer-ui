import { Address4, Address6 } from 'ip-address';
import {
  Cluster,
  ClusterDefaultConfig,
  ClusterNetwork,
  Inventory,
  MachineNetwork,
  ServiceNetwork,
  stringToJSON,
} from '../../api';
import { NETWORK_TYPE_OVN, NETWORK_TYPE_SDN, NO_SUBNET_SET } from '../../config';
import {
  selectClusterNetworkCIDR,
  selectClusterNetworkHostPrefix,
  selectServiceNetworkCIDR,
  selectSchedulableMasters,
} from '../../selectors';
import {
  HostDiscoveryValues,
  HostSubnets,
  StorageValues,
  Validation,
  ValidationGroup,
  ValidationsInfo,
} from '../../types/clusters';
import { getHostname } from '../hosts/utils';

export const getSubnet = (cidr: string): Address6 | Address4 | null => {
  if (Address4.isValid(cidr)) {
    return new Address4(cidr);
  } else if (Address6.isValid(cidr)) {
    return new Address6(cidr);
  } else {
    return null;
  }
};

export const getHumanizedSubnetRange = (subnet: Address6 | Address4 | null) => {
  if (subnet) {
    const subnetStart = subnet.startAddress().correctForm();
    const subnetEnd = subnet.endAddress().correctForm();
    return `(${subnetStart} - ${subnetEnd})`;
  }

  return '';
};

export const getHumanizedSubnet = (subnet: Address6 | Address4 | null) => {
  if (subnet) {
    return `${subnet.address} ${getHumanizedSubnetRange(subnet)}`;
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
  return subnet?.address;
};

export const serviceNetworksEqual = (array1: ServiceNetwork[], array2: ServiceNetwork[]) => {
  const cidrs = array2.map((elem) => elem.cidr);
  return array1.length === array2.length && array1.every((network) => cidrs.includes(network.cidr));
};

export const clusterNetworksEqual = (array1: ClusterNetwork[], array2: ClusterNetwork[]) =>
  array1.length === array2.length &&
  array1.every((clusterNetwork) =>
    array2.find(
      (network) =>
        network.cidr === clusterNetwork.cidr && network.hostPrefix === clusterNetwork.hostPrefix,
    ),
  );

export const isAdvNetworkConf = (
  cluster: Cluster,
  defaultNetworkSettings: ClusterDefaultConfig,
  defaultNetworkType: string,
) =>
  selectClusterNetworkCIDR(cluster) !== defaultNetworkSettings.clusterNetworkCidr ||
  selectClusterNetworkHostPrefix(cluster) !== defaultNetworkSettings.clusterNetworkHostPrefix ||
  selectServiceNetworkCIDR(cluster) !== defaultNetworkSettings.serviceNetworkCidr ||
  (Boolean(cluster.networkType) && cluster.networkType !== defaultNetworkType);

export const canSelectNetworkTypeSDN = (isSNO: boolean, isIPv6 = false) => {
  return !(isSNO || isIPv6);
};

export const getDefaultNetworkType = (isSNO: boolean, isIPv6 = false) => {
  return isSNO || isIPv6 ? NETWORK_TYPE_OVN : NETWORK_TYPE_SDN;
};

export const canBeDualStack = (subnets: HostSubnets) =>
  subnets.some((subnet) => Address4.isValid(subnet.subnet)) &&
  subnets.some((subnet) => Address6.isValid(subnet.subnet));

const areNetworksDualStack = (
  networks: (MachineNetwork | ClusterNetwork | ServiceNetwork)[] | undefined,
) =>
  networks &&
  networks.length > 1 &&
  Address4.isValid(networks[0].cidr || '') &&
  Address6.isValid(networks[1].cidr || '');

export const isDualStack = ({
  machineNetworks,
  clusterNetworks,
  serviceNetworks,
}: Pick<Cluster, 'machineNetworks' | 'clusterNetworks' | 'serviceNetworks'>) =>
  areNetworksDualStack(machineNetworks) &&
  areNetworksDualStack(clusterNetworks) &&
  areNetworksDualStack(serviceNetworks);

export const isSubnetInIPv6 = ({
  clusterNetworkCidr,
  machineNetworkCidr,
  serviceNetworkCidr,
}: Pick<Cluster, 'clusterNetworkCidr' | 'machineNetworkCidr' | 'serviceNetworkCidr'>) =>
  Address6.isValid(clusterNetworkCidr || '') ||
  Address6.isValid(machineNetworkCidr || '') ||
  Address6.isValid(serviceNetworkCidr || '');

export const getHostDiscoveryInitialValues = (cluster: Cluster): HostDiscoveryValues => {
  return {
    usePlatformIntegration: cluster.platform?.type !== 'baremetal',
    schedulableMasters: selectSchedulableMasters(cluster),
  };
};

export const getStorageInitialValues = (): StorageValues => {
  // TODO (dchason): add initial values to node labeling
  return {
    nodeLabeling: '',
  };
};

export function filterValidationsInfoByGroup(
  validationsInfo: ValidationsInfo,
  selectedGroups: ValidationGroup[] = ['configuration', 'hosts-data', 'network', 'operators'],
): ValidationsInfo {
  const result = {};
  (Object.keys(validationsInfo) as ValidationGroup[]).forEach((groupKey) => {
    if (selectedGroups.includes(groupKey)) result[groupKey] = validationsInfo[groupKey];
  });
  return result;
}

export function filterValidationsInfoByStatus(
  validationsInfo: ValidationsInfo,
  selectedStatuses: Validation['status'][] = ['failure', 'pending', 'error'],
): ValidationsInfo {
  const result = {};
  Object.entries(validationsInfo).forEach(([group, validations = []]) => {
    const filteredValidations = validations.filter((validation) =>
      selectedStatuses.includes(validation.status),
    );
    if (filteredValidations.length) result[group] = filteredValidations;
  });
  return result;
}
