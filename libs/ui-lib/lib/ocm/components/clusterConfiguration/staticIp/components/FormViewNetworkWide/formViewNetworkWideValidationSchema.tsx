import * as Yup from 'yup';

import {
  IpConfig,
  ProtocolVersion,
  FormViewNetworkWideValues,
  Cidr,
  StaticProtocolType,
} from '../../data/dataTypes';

import { showProtocolVersion } from '../../data/protocolVersion';
import { getMachineNetworkCidr } from '../../data/machineNetwork';
import {
  getIpAddressInSubnetValidationSchema,
  getIpAddressValidationSchema,
  getIpIsNotNetworkOrBroadcastAddressSchema,
  getMultipleIpAddressValidationSchema,
  isNotReservedHostIPAddress,
  isNotReservedHostDNSAddress,
} from '../../commonValidationSchemas';

const REQUIRED_MESSAGE = 'A value is required';
const MUST_BE_A_NUMBER = 'Must be a number';
const ONLY_DIGITS_REGEX = /^\d+$/;

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
  protocolVersion: ProtocolVersion,
  machineNetwork: Cidr,
) => {
  return getIpAddressInSubnetValidationSchema(
    protocolVersion,
    getMachineNetworkCidr(machineNetwork),
  );
};

export const getIsNotNetworkOrBroadcastAddressSchema = (
  protocolVersion: ProtocolVersion,
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
    .concat(isNotReservedHostIPAddress(protocolVersion));
};

const getDNSValidationSchema = (protocolType: StaticProtocolType) => {
  if (protocolType === 'dualStack') {
    return getMultipleIpAddressValidationSchema()
      .required(REQUIRED_MESSAGE)
      .concat(isNotReservedHostDNSAddress());
  }
  return getMultipleIpAddressValidationSchema(ProtocolVersion.ipv4)
    .required(REQUIRED_MESSAGE)
    .concat(isNotReservedHostDNSAddress(ProtocolVersion.ipv4));
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
      ipv4: getAddressDataValidationSchema(ProtocolVersion.ipv4, values.ipConfigs.ipv4),
      ipv6: showProtocolVersion(values.protocolType, ProtocolVersion.ipv6)
        ? getAddressDataValidationSchema(ProtocolVersion.ipv6, values.ipConfigs.ipv6)
        : Yup.object<IpConfig>(),
    });
    return Yup.object().shape({
      useVlan: Yup.boolean(),
      vlanId: Yup.mixed().when('useVlan', {
        is: true,
        then: () =>
          Yup.number()
            .required(MUST_BE_A_NUMBER)
            .min(1, `Must be more than or equal to 1`)
            .max(MAX_VLAN_ID, `Must be less than or equal to ${MAX_VLAN_ID}`)
            .test('not-number', MUST_BE_A_NUMBER, () => validateNumber(values.vlanId))
            .nullable()
            .transform(transformNumber) as Yup.NumberSchema,
      }),
      protocolType: Yup.string(),
      dns: getDNSValidationSchema(values.protocolType),
      ipConfigs: ipConfigsValidationSchemas,
    });
  },
);

export const validateNumber = (vlanId: FormViewNetworkWideValues['vlanId']) => {
  //We need to validate that value is a number(without letters) and is not an exponential number (ex: 1e2)
  return new RegExp(ONLY_DIGITS_REGEX).test((vlanId || '').toString());
};
