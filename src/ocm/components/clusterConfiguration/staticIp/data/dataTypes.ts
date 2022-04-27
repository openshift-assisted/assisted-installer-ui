import { HostStaticNetworkConfig } from '../../../../../common';

export enum StaticIpView {
  YAML = 'yaml',
  FORM = 'form',
}

export type ProtocolVersion = 'ipv4' | 'ipv6';
export type StaticProtocolType = 'ipv4' | 'dualStack';

export type Cidr = {
  ip: string;
  prefixLength: number | '';
};

export type IpConfig = {
  machineNetwork: Cidr;
  gateway: string;
  dns: string;
};

export type IpConfigs = { [protocolVersion in ProtocolVersion]: IpConfig };

export type HostIps = { [protocolVersion in ProtocolVersion]: string };

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

export type YamlViewValues = {
  hosts: HostStaticNetworkConfig[];
};

export type FormViewHostsValues = {
  hosts: FormViewHost[];
};

export type FormViewNetworkWideValues = {
  protocolType: StaticProtocolType;
  useVlan: boolean;
  vlanId: number | '';
  ipConfigs: IpConfigs;
};
