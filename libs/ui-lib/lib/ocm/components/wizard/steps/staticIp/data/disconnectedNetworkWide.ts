import { Address4, Address6 } from 'ip-address';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { FormViewNetworkWideValues, ProtocolVersion } from './dataTypes';
import { getEmptyIpConfig } from './emptyData';
import { getFormViewNetworkWideValues } from './fromInfraEnv';
import { networkWideToInfraEnvField } from './formDataToInfraEnvField';

export const DISCONNECTED_SINGLE_STACK_FIELD = ProtocolVersion.ipv4;

const isIpv6OnlyAddress = (ip: string): boolean => Address6.isValid(ip) && !Address4.isValid(ip);

export const normalizeDisconnectedNetworkWideForLoad = (
  values: FormViewNetworkWideValues,
): FormViewNetworkWideValues => {
  if (values.protocolType === 'dualStack') {
    return values;
  }
  if (values.protocolType === 'ipv6') {
    return {
      ...values,
      protocolType: 'ipv4',
      ipConfigs: {
        ipv4: { ...values.ipConfigs.ipv6 },
        ipv6: getEmptyIpConfig(),
      },
    };
  }
  return {
    ...values,
    ipConfigs: {
      ipv4: { ...values.ipConfigs.ipv4 },
      ipv6: getEmptyIpConfig(),
    },
  };
};

export const normalizeDisconnectedNetworkWideForSave = (
  values: FormViewNetworkWideValues,
): FormViewNetworkWideValues => {
  if (values.protocolType === 'dualStack') {
    return values;
  }

  const singleStackConfig = values.ipConfigs[DISCONNECTED_SINGLE_STACK_FIELD];
  const subnetIp = singleStackConfig.machineNetwork.ip;

  if (subnetIp && isIpv6OnlyAddress(subnetIp)) {
    return {
      ...values,
      protocolType: 'ipv6',
      ipConfigs: {
        ipv4: getEmptyIpConfig(),
        ipv6: { ...singleStackConfig },
      },
    };
  }

  return {
    ...values,
    protocolType: 'ipv4',
    ipConfigs: {
      ipv4: { ...singleStackConfig },
      ipv6: getEmptyIpConfig(),
    },
  };
};

export const getDisconnectedFormViewNetworkWideValues = (
  infraEnv: InfraEnv,
): FormViewNetworkWideValues => {
  const values = getFormViewNetworkWideValues(infraEnv);
  return normalizeDisconnectedNetworkWideForLoad(values);
};

export const disconnectedNetworkWideToInfraEnvField = (
  currentInfraEnv: InfraEnv,
  networkWide: FormViewNetworkWideValues,
) => {
  const normalized = normalizeDisconnectedNetworkWideForSave(networkWide);
  return networkWideToInfraEnvField(currentInfraEnv, normalized);
};
