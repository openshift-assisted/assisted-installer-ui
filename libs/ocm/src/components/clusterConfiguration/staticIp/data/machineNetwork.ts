import { Cidr } from './dataTypes';

export const getMachineNetworkCidr = (machineNetwork: Cidr) => {
  return `${machineNetwork.ip}/${machineNetwork.prefixLength}`;
};
