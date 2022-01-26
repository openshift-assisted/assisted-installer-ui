import _ from 'lodash/fp';
import { Cluster, CpuArchitecture } from '../../common/api/types';

export const selectMachineNetworkCIDR = ({
  machineNetworks,
  machineNetworkCidr,
}: Partial<Cluster>) => _.head(machineNetworks)?.cidr ?? machineNetworkCidr;
export const selectClusterNetworkCIDR = ({
  clusterNetworks,
  clusterNetworkCidr,
}: Partial<Cluster>) => _.head(clusterNetworks)?.cidr ?? clusterNetworkCidr;
export const selectClusterNetworkHostPrefix = ({
  clusterNetworks,
  clusterNetworkHostPrefix,
}: Partial<Cluster>) => _.head(clusterNetworks)?.hostPrefix ?? clusterNetworkHostPrefix;
export const selectServiceNetworkCIDR = ({
  serviceNetworks,
  serviceNetworkCidr,
}: Partial<Cluster>) => _.head(serviceNetworks)?.cidr ?? serviceNetworkCidr;
export const isSNO = ({ highAvailabilityMode }: Partial<Cluster>) =>
  highAvailabilityMode === 'None';
export const isArmArchitecture = ({ cpuArchitecture }: Partial<Cluster>) =>
  cpuArchitecture === CpuArchitecture.ARM;
