import { HostStaticNetworkConfig } from '../../../../../common';

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

export type HostIps = { [protocolVersion in ProtocolVersion]: string };

export type MachineNetworks = { [protocolVersion in ProtocolVersion]: string };

export type FormViewHost = {
  macAddress: string;
  ips: HostIps;
};

export type StaticFormData = {
  networkWide: FormViewNetworkWideValues;
  hosts: FormViewHost[];
};

export type StaticIpInfo = {
  isDataComplete: boolean;
  view: StaticIpView;
  formViewProtocolType: StaticProtocolType | null;
};

export interface YamlViewValues {
  hosts: HostStaticNetworkConfig[];
}

export interface FormViewHostsValues {
  hosts: FormViewHost[];
}

export interface FormViewNetworkWideValues {
  protocolType: StaticProtocolType;
  useVlan: boolean;
  vlanId: number | '';
  dns: string;
  ipConfigs: IpConfigs;
}
