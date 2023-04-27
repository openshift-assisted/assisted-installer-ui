import { HostStaticNetworkConfig } from '../../../../../common';
import {
  FormViewHost,
  IpConfig,
  FormViewNetworkWideValues,
  FormViewHostsValues,
  YamlViewValues,
  HostIps,
} from './dataTypes';

export const getEmptyHostIps = (): HostIps => {
  return {
    ipv4: '',
    ipv6: '',
  };
};

export const getEmptyFormViewHost = (): FormViewHost => {
  return {
    macAddress: '',
    ips: getEmptyHostIps(),
  };
};

export const getEmptyIpConfig = (): IpConfig => {
  return {
    machineNetwork: {
      ip: '',
      prefixLength: '',
    },
    gateway: '',
  };
};

export const getEmptyYamlHost = (): HostStaticNetworkConfig => {
  return {
    networkYaml: '',
    macInterfaceMap: [{ macAddress: '', logicalNicName: '' }],
  };
};

export const getEmptyNetworkWideConfigurations = (): FormViewNetworkWideValues => {
  return {
    ipConfigs: {
      ipv4: getEmptyIpConfig(),
      ipv6: getEmptyIpConfig(),
    },
    protocolType: 'ipv4',
    useVlan: false,
    vlanId: '',
    dns: '',
  };
};

export const getEmptyFormViewHostsValues = (): FormViewHostsValues => {
  return { hosts: [getEmptyFormViewHost()] };
};

export const getEmptyYamlValues = (): YamlViewValues => {
  return { hosts: [getEmptyYamlHost()] };
};
