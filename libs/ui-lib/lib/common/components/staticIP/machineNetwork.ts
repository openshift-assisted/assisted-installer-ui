import { Cidr } from './types';

export const getMachineNetworkCidr = (machineNetwork: Cidr) => {
  return `${machineNetwork.ip}/${machineNetwork.prefixLength}`;
};
