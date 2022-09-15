import * as Yup from 'yup';

import { IpConfig, ProtocolVersion, FormViewNetworkWideValues, Cidr } from '../../data/dataTypes';

import { showProtocolVersion } from '../../data/protocolVersion';
import { getMachineNetworkCidr } from '../../data/machineNetwork';
import {
  getIpAddressInSubnetValidationSchema,
  getIpAddressValidationSchema,
  isNotLocalHostIPAddress,
  isNotCatchAllIPAddress,
  getIpIsNotNetworkOrBroadcastAddressSchema,
} from '../../commonValidationSchemas';
const REQUIRED_MESSAGE = 'A value is required';
const REQUIRED_MESSAGE_AND_MUST_BE_A_NUMBER = 'A value is required and must be a number';

export const MIN_PREFIX_LENGTH = 1;
export const MAX_PREFIX_LENGTH = {
  ipv4: 32,
  ipv6: 128,
};

export const MIN_VLAN_ID = 1;
export const MAX_VLAN_ID = 4094;

const transformNumber = (originalValue: number) => {
  return isNaN(originalValue) ? null : originalValue;
};

export const getInMachineNetworkValidationSchema = (
  protocolVersion: 'ipv4' | 'ipv6',
  machineNetwork: Cidr,
) => {
  return getIpAddressInSubnetValidationSchema(
    protocolVersion,
    getMachineNetworkCidr(machineNetwork),
  );
};

export const getIsNotNetworkOrBroadcastAddressSchema = (
  protocolVersion: 'ipv4' | 'ipv6',
  machineNetwork: Cidr,
) => {
  return getIpIsNotNetworkOrBroadcastAddressSchema(
    protocolVersion,
    getMachineNetworkCidr(machineNetwork),
  );
};

const getMachineNetworkValidationSchema = (protocolVersion: ProtocolVersion) =>
  Yup.object<Cidr>().shape({
    ip: getIPValidationSchema(protocolVersion),
    prefixLength: Yup.number()
      .required('Prefix length is required')
      .min(1, `Prefix length must be more than or equal to 1`)
      .max(
        MAX_PREFIX_LENGTH[protocolVersion],
        `Prefix length must be less than or equal to ${MAX_PREFIX_LENGTH[protocolVersion]}`,
      )
      .nullable()
      .transform(transformNumber) as Yup.NumberSchema, //add casting to not get typescript error caused by nullable
  });

const getIPValidationSchema = (protocolVersion: ProtocolVersion) => {
  return getIpAddressValidationSchema(protocolVersion)
    .required(REQUIRED_MESSAGE)
    .concat(isNotLocalHostIPAddress(protocolVersion))
    .concat(isNotCatchAllIPAddress(protocolVersion));
};

const getAddressDataValidationSchema = (protocolVersion: ProtocolVersion, ipConfig: IpConfig) => {
  return Yup.object().shape<IpConfig>({
    machineNetwork: getMachineNetworkValidationSchema(protocolVersion),
    gateway: getIPValidationSchema(protocolVersion)
      .concat(getInMachineNetworkValidationSchema(protocolVersion, ipConfig.machineNetwork))
      .concat(getIsNotNetworkOrBroadcastAddressSchema(protocolVersion, ipConfig.machineNetwork)),
  });
};

export const networkWideValidationSchema = Yup.lazy<FormViewNetworkWideValues>(
  (values: FormViewNetworkWideValues) => {
    const ipConfigsValidationSchemas = Yup.object().shape({
      ipv4: getAddressDataValidationSchema('ipv4', values.ipConfigs.ipv4),
      ipv6: showProtocolVersion(values.protocolType, 'ipv6')
        ? getAddressDataValidationSchema('ipv6', values.ipConfigs.ipv6)
        : Yup.object<IpConfig>(),
    });
    return Yup.object().shape({
      useVlan: Yup.boolean(),
      vlanId: Yup.mixed().when('useVlan', {
        is: true,
        then: Yup.number()
          .required(REQUIRED_MESSAGE_AND_MUST_BE_A_NUMBER)
          .min(1, `Must be more than or equal to 1`)
          .max(MAX_VLAN_ID, `Must be less than or equal to ${MAX_VLAN_ID}`)
          .nullable()
          .transform(transformNumber) as Yup.NumberSchema,
      }),
      protocolType: Yup.string(),
      dns: getIPValidationSchema('ipv4'),
      ipConfigs: ipConfigsValidationSchemas,
    });
  },
);
