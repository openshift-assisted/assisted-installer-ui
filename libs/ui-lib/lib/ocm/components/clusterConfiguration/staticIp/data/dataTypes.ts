import { HostStaticNetworkConfig } from '@openshift-assisted/types/assisted-installer-service';
import {
  IpConfigs,
  ProtocolVersion,
  StaticIpView,
  StaticProtocolType,
} from '../../../../../common';

export type HostIps = { [protocolVersion in ProtocolVersion]: string };

export type MachineNetworks = { [protocolVersion in ProtocolVersion]: string };

export type FormViewHost = {
  macAddress: string;
  ips: HostIps;
  useBond: boolean;
  bondType: string;
  bondPrimaryInterface: string;
  bondSecondaryInterface: string;
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
