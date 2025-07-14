export enum StaticIpView {
  YAML = 'yaml',
  FORM = 'form',
}

export enum ProtocolVersion {
  ipv4 = 'ipv4',
  ipv6 = 'ipv6',
}

export type StaticProtocolType = 'ipv4' | 'dualStack';

export type Cidr = {
  ip: string;
  prefixLength: number | '';
};

export type IpConfig = {
  machineNetwork: Cidr;
  gateway: string;
};

export type IpConfigs = { [protocolVersion in ProtocolVersion]: IpConfig };
