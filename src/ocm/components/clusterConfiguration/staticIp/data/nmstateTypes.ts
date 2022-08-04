import { ProtocolVersion } from './dataTypes';

export enum NmstateInterfaceType {
  ETHERNET = 'ethernet',
  VLAN = 'vlan',
}

export type NmstateAddress = {
  ip: string;
  'prefix-length': number;
};

export type NmstateProtocolConfig = {
  address: NmstateAddress[];
  enabled: boolean;
  dhcp: boolean;
};

export type NmstateProtocolConfigs = {
  [protocolVersion in ProtocolVersion]?: NmstateProtocolConfig;
};

export type NmstateEthernetInterface = {
  name: string;
  type: NmstateInterfaceType.ETHERNET;
  state: string;
} & NmstateProtocolConfigs;

export type NmstateRoutesConfig = {
  destination: string;
  'next-hop-address': string;
  'next-hop-interface': string;
  'table-id': number;
};

export type NmstateRoutes = {
  config: NmstateRoutesConfig[];
};

export type NmstateDns = {
  config: {
    server: string[];
  };
};

export type NmstateVlanInterface = {
  name: string;
  type: NmstateInterfaceType.VLAN;
  state: string;
  vlan: {
    'base-iface': string;
    id: number;
  };
} & NmstateProtocolConfigs;

export type NmstateInterface = NmstateEthernetInterface | NmstateVlanInterface;

export const isVlanInterface = (
  nmStateInterface: NmstateVlanInterface | NmstateEthernetInterface,
): nmStateInterface is NmstateVlanInterface => {
  return nmStateInterface.type === NmstateInterfaceType.VLAN;
};

export const isEthernetInterface = (
  nmStateInterface: NmstateVlanInterface | NmstateEthernetInterface,
): nmStateInterface is NmstateEthernetInterface => {
  return nmStateInterface.type === NmstateInterfaceType.ETHERNET;
};

export type Nmstate = {
  'dns-resolver'?: NmstateDns;
  routes?: {
    config: {
      destination: string;
      'next-hop-address': string;
      'next-hop-interface': string;
      'table-id': number;
    }[];
  };
  interfaces: NmstateInterface[];
};
