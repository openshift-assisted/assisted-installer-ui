import head from 'lodash/fp/head';
import { stringToJSON } from '../api/utils';
import { CpuArchitecture, HostSubnets, ValidationsInfo } from '../types';
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

export const selectMonitoredOperators = (cluster?: Pick<Cluster, 'monitoredOperators'>) => {
  // monitoredOperators can sometimes be either undefined or also null, we must use the fallback
  return cluster?.monitoredOperators || [];
};

export const selectOlmOperators = (cluster?: Pick<Cluster, 'monitoredOperators'>) => {
  return selectMonitoredOperators(cluster).filter((operator) => operator.operatorType === 'olm');
};

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

export const canBeDualStack = (subnets: HostSubnets) =>
  subnets.some((subnet) => Address4.isValid(subnet.subnet)) &&
  subnets.some((subnet) => Address6.isValid(subnet.subnet));

export const selectIpv4Cidr = (subnets: MachineNetwork[] | ClusterNetwork[] | ServiceNetwork[]) =>
  head(subnets)?.cidr;

export const selectIpv6Cidr = (subnets: MachineNetwork[] | ClusterNetwork[] | ServiceNetwork[]) =>
  subnets[1].cidr;

export const selectIpv4HostPrefix = (subnets: ClusterNetwork[]) => head(subnets)?.hostPrefix;

export const selectIpv6HostPrefix = (subnets: ClusterNetwork[]) => subnets[1].hostPrefix;
