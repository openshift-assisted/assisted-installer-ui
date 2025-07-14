import { HostStaticNetworkConfig } from '@openshift-assisted/types/assisted-installer-service';
import {
  FormViewHost,
  FormViewNetworkWideValues,
  FormViewHostsValues,
  YamlViewValues,
  HostIps,
} from './dataTypes';
import { IpConfig } from '../../../../../common';

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
    useBond: false,
    bondType: 'active-backup',
    bondPrimaryInterface: '',
    bondSecondaryInterface: '',
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
