import head from 'lodash/fp/head';
import { stringToJSON } from '../api/utils';
import {
  CpuArchitecture,
  HostSubnets,
  NetworkConfigurationValues,
  ValidationsInfo,
} from '../types';
import { Cluster, ClusterNetwork, MachineNetwork, ServiceNetwork } from '../api/types';
import { NETWORK_TYPE_OVN, NETWORK_TYPE_SDN } from '../config';
import { Address4, Address6 } from 'ip-address';

export const selectMachineNetworkCIDR = ({
  machineNetworks,
  machineNetworkCidr,
}: Partial<Cluster>) => head(machineNetworks)?.cidr ?? machineNetworkCidr;
export const selectClusterNetworkCIDR = ({
  clusterNetworks,
  clusterNetworkCidr,
}: Partial<Cluster>) => head(clusterNetworks)?.cidr ?? clusterNetworkCidr;
export const selectClusterNetworkHostPrefix = ({
  clusterNetworks,
  clusterNetworkHostPrefix,
}: Partial<Cluster>) => head(clusterNetworks)?.hostPrefix ?? clusterNetworkHostPrefix;
export const selectServiceNetworkCIDR = ({
  serviceNetworks,
  serviceNetworkCidr,
}: Partial<Cluster>) => head(serviceNetworks)?.cidr ?? serviceNetworkCidr;
export const isSNO = ({ highAvailabilityMode }: Partial<Cluster>) =>
  highAvailabilityMode === 'None';
export const isArmArchitecture = ({ cpuArchitecture }: Partial<Cluster>) =>
  cpuArchitecture === CpuArchitecture.ARM;
export const selectClusterValidationsInfo = ({ validationsInfo }: Partial<Cluster>) => {
  return stringToJSON<ValidationsInfo>(validationsInfo);
};
export const getDefaultNetworkType = (isSNO: boolean, isIPv6 = false) => {
  return isSNO || isIPv6 ? NETWORK_TYPE_OVN : NETWORK_TYPE_SDN;
};
export const canSelectNetworkTypeSDN = (isSNO: boolean, isIPv6 = false) => {
  return !(isSNO || isIPv6);
};
export const isSubnetInIPv6 = ({
  clusterNetworkCidr,
  machineNetworkCidr,
  serviceNetworkCidr,
}: Partial<Cluster>) => {
  return (
    Address6.isValid(clusterNetworkCidr || '') ||
    Address6.isValid(machineNetworkCidr || '') ||
    Address6.isValid(serviceNetworkCidr || '')
  );
};

export const allSubnetsIPv4 = (
  networks: (MachineNetwork | ClusterNetwork | ServiceNetwork)[] | undefined,
) => {
  return !!networks?.every((network) => network.cidr && Address4.isValid(network.cidr));
};

export const allHostSubnetsIPv4 = (subnets: HostSubnets) =>
  subnets.every((subnet) => Address4.isValid(subnet.subnet));

export const isIPv4 = ({
  machineNetworks,
  clusterNetworks,
  serviceNetworks,
}: Cluster | NetworkConfigurationValues) =>
  allSubnetsIPv4(machineNetworks) &&
  allSubnetsIPv4(clusterNetworks) &&
  allSubnetsIPv4(serviceNetworks);
